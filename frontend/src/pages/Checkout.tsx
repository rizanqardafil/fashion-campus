import { useEffect, useRef, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { ApiError, OrderService, SearchService, UserService } from '../api';
import Button from '../components/button/Button';
import Input from '../components/input/Input';
import { convertToCurrency, roundDecimal } from '../components/util/utilFunc';
import { useCart } from '../context/CartContext';

type PaymentType = 'BALANCE';
type DeliveryType = 'REGULAR' | 'NEXT_DAY';

const ShoppingCart = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [addressName, setAddressName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentType>('BALANCE');
  const [delivery, setDelivery] = useState<DeliveryType>('REGULAR');

  const [useUserAddress, setUseUserAddress] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [showerThought, setShowerThought] = useState('');
  const indexShowerThought = useRef(0);

  const fetchUserAddress = useQuery('userAddress', () =>
    UserService.getUserShippingAddress()
  );

  const fetchOrder = useQuery('order', () => UserService.getOrdersUser(), {
    enabled: false,
  });

  const fetchShowerThought = useQuery(
    'showerThought',
    () => SearchService.showerThoughts(),
    {
      staleTime: 10000,
      onSuccess: (data) => {
        setShowerThought(data.data[indexShowerThought.current]);
        indexShowerThought.current++;
      },
    }
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (fetchShowerThought.data != null) {
        if (
          indexShowerThought.current === fetchShowerThought.data?.data.length
        ) {
          indexShowerThought.current = 0;
        }
        setShowerThought(
          fetchShowerThought.data?.data[indexShowerThought.current]
        );
        indexShowerThought.current++;
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [fetchShowerThought.data]);

  const createOrder = useMutation(OrderService.createOrder, {
    onSuccess: (data) => {
      toast.success(data.message);
      fetchOrder.refetch();
      queryClient.invalidateQueries('cart');
      queryClient.invalidateQueries('user');

      navigate('/profile/order');
    },
    onError: (error: ApiError) => {
      toast.error(error.body.message);
      setProcessing(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProcessing(true);
    createOrder.mutate({
      shipping_method: delivery === 'REGULAR' ? 'Regular' : 'Next Day',
      shipping_address: {
        address_name: addressName,
        phone_number: phoneNumber,
        address,
        city,
      },
      send_email: sendEmail,
    });
  };

  useEffect(() => {
    if (useUserAddress && fetchUserAddress.data != null) {
      setAddressName(fetchUserAddress.data.address_name ?? '');
      setPhoneNumber(fetchUserAddress.data.phone_number ?? '');
      setAddress(fetchUserAddress.data.address ?? '');
      setCity(fetchUserAddress.data.city ?? '');
    }
  }, [useUserAddress, fetchUserAddress.data]);

  if (fetchUserAddress.isLoading) {
    return <div>Loading...</div>;
  }

  const subtotal = roundDecimal(
    cart.data.reduce((acc, item) => {
      return acc + item.details.quantity * item.price;
    }, 0)
  );

  //  Regular:
  //  If total price of items < 200k: Shipping price is 15% of the total price of items purchased
  //  If total price of items >= 200k: Shipping price is 20% of the total price of items purchased
  const regularDelivery = subtotal < 200000 ? subtotal * 0.15 : subtotal * 0.2;

  //  Next Day:
  //  If total price of items < 300k: Shipping price is 20% of the total price of items purchased
  //  If total price of items >= 300k: Shipping price is 25% of the total price of items purchased
  const nextDayDelivery = subtotal < 300000 ? subtotal * 0.2 : subtotal * 0.25;

  return (
    <main id="main-content" className="mx-auto mt-24 min-h-[60vh] max-w-7xl">
      {processing && (
        <div className="loading-overlay fixed top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center gap-y-4 bg-white bg-opacity-80">
          <p className="text-2xl font-semibold text-gray-500">
            Processing Your Order...
          </p>
          <AiOutlineLoading3Quarters className="my-3 animate-spin-slow text-7xl text-gray-300" />
          <p className="text-xl font-semibold text-gray-400">{showerThought}</p>
        </div>
      )}
      {/* ===== Heading & Continue Shopping */}
      <div className="app-max-width w-full border-t-2 border-gray-100 px-4 sm:px-8 md:px-20">
        <h1 className="mt-6 mb-2 text-center text-2xl sm:text-left sm:text-4xl">
          Checkout
        </h1>
      </div>
      {/* ===== Form Section ===== */}
      <form
        className="app-max-width mb-14 flex flex-col px-4 sm:px-8 md:px-20 lg:flex-row"
        onSubmit={handleSubmit}
      >
        <section className="mr-8 h-full w-full lg:w-7/12">
          <div className="my-4">
            <label htmlFor="addressName" className="text-lg">
              Addres Name
            </label>
            <Input
              name="addressName"
              type="text"
              extraClass={`${
                useUserAddress ? 'bg-gray-100' : ''
              } w-full mt-1 mb-2`}
              border="border-2 border-gray-400"
              value={addressName}
              onChange={(e) =>
                setAddressName((e.target as HTMLInputElement).value)
              }
              readOnly={useUserAddress}
              required
            />
          </div>

          <div className="my-4">
            <label htmlFor="phoneNumber" className="mb-1 text-lg">
              Phone Number
            </label>
            <Input
              name="phoneNumber"
              type="text"
              extraClass={`${
                useUserAddress ? 'bg-gray-100' : ''
              } w-full mt-1 mb-2`}
              border="border-2 border-gray-400"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber((e.target as HTMLInputElement).value)
              }
              readOnly={useUserAddress}
              required
            />
          </div>

          <div className="my-4">
            <label htmlFor="address" className="text-lg">
              Address
            </label>
            <Input
              name="address"
              type="text"
              extraClass={`${
                useUserAddress ? 'bg-gray-100' : ''
              } w-full mt-1 mb-2`}
              border="border-2 border-gray-400"
              value={address}
              onChange={(e) => setAddress((e.target as HTMLInputElement).value)}
              readOnly={useUserAddress}
              required
            />
          </div>

          <div className="my-4">
            <label htmlFor="city" className="text-lg">
              City
            </label>
            <Input
              name="city"
              type="text"
              extraClass={`${
                useUserAddress ? 'bg-gray-100' : ''
              } w-full mt-1 mb-2`}
              border="border-2 border-gray-400"
              value={city}
              onChange={(e) => setCity((e.target as HTMLInputElement).value)}
              readOnly={useUserAddress}
              required
            />
          </div>
          <button
            type="button"
            className=" flex place-items-center"
            onClick={() => setUseUserAddress(!useUserAddress)}
          >
            <div className="relative mr-2 inline-block w-10 select-none align-middle transition duration-200 ease-in">
              <input
                type="checkbox"
                name="toggle-user-address"
                id="toggle-user-address"
                checked={useUserAddress}
                onChange={() => setUseUserAddress(!useUserAddress)}
                className={`${
                  useUserAddress ? 'right-0 border-gray-500' : 'border-gray-300'
                } absolute block h-6 w-6 cursor-pointer appearance-none rounded-full border-4  bg-white`}
              />
              <label
                htmlFor="toggle"
                className={`${
                  useUserAddress ? ' bg-gray-500' : 'bg-gray-300'
                }  block h-6 cursor-pointer overflow-hidden rounded-full `}
              ></label>
            </div>
            <label htmlFor="toggle-user-address">
              Use my address as shipping address
            </label>
          </button>
        </section>
        {/* Cart Totals */}
        <section className="mt-10 h-full w-full lg:mt-4 lg:w-5/12">
          <div className="divide-y-2 divide-gray-200 border border-gray-500 p-6">
            <div className="flex justify-between">
              <span className="mb-3 text-base uppercase">Product</span>
              <span className="mb-3 text-base uppercase">SUBTOTAL</span>
            </div>

            <div className="pt-2">
              {cart.data.map((item) => (
                <div className="mb-2 flex justify-between" key={item.id}>
                  <div className="  flex">
                    <span className="max-w-[10rem] overflow-clip text-ellipsis whitespace-pre text-base font-medium">
                      {item.name}{' '}
                    </span>
                    <span className="text-gray-400">
                      {' '}
                      ({item.details.size}) x {item.details.quantity}
                    </span>
                  </div>
                  <div className="text-base">
                    {convertToCurrency(
                      roundDecimal(item.price * item.details.quantity)
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between py-3">
              <span className="uppercase">SUBTOTAL</span>
              <span>{convertToCurrency(subtotal)}</span>
            </div>

            <div className="py-3">
              <span className="uppercase">DELIVERY</span>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between accent-gray-600">
                  <div>
                    <input
                      type="radio"
                      name="delivery"
                      value="REGULAR"
                      id="regular"
                      checked={delivery === 'REGULAR'}
                      onChange={() => setDelivery('REGULAR')}
                    />{' '}
                    <label htmlFor="regular" className="cursor-pointer">
                      Regular
                    </label>
                  </div>
                  <span>{convertToCurrency(regularDelivery)}</span>
                </div>
                <div className="flex justify-between accent-gray-600">
                  <div>
                    <input
                      type="radio"
                      name="delivery"
                      value="NEXT_DAY"
                      id="next_day"
                      checked={delivery === 'NEXT_DAY'}
                      onChange={() => setDelivery('NEXT_DAY')}
                    />{' '}
                    <label htmlFor="next_day" className="cursor-pointer">
                      Next Day
                    </label>
                  </div>
                  <span>{convertToCurrency(nextDayDelivery)}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between py-3">
                <span>Grand Total</span>
                <span>
                  {convertToCurrency(
                    roundDecimal(
                      +subtotal +
                        (delivery === 'REGULAR'
                          ? regularDelivery
                          : nextDayDelivery)
                    )
                  )}
                </span>
              </div>

              <div className="mt-2 mb-4 grid gap-4">
                <label
                  htmlFor="plan-bank"
                  className="relative flex cursor-pointer flex-col rounded-lg border border-gray-300 bg-white p-5 shadow-md"
                >
                  <span className="font-semibold capitalize leading-tight text-gray-500">
                    Balance
                  </span>
                  <span className="mt-1 text-sm text-gray-400">
                    Pay with your balance
                  </span>
                  <input
                    type="radio"
                    name="plan"
                    id="plan-bank"
                    value="BALANCE"
                    className="absolute h-0 w-0 appearance-none"
                    onChange={() => setPaymentMethod('BALANCE')}
                  />
                  <span
                    aria-hidden="true"
                    className={`${
                      paymentMethod === 'BALANCE' ? 'block' : 'hidden'
                    } absolute inset-0 rounded-lg border-2 border-gray-500 bg-opacity-10`}
                  >
                    <span className="absolute top-4 right-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5 text-green-600"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </span>
                </label>
              </div>

              <div className="my-8">
                <button
                  type="button"
                  className=" flex place-items-center"
                  onClick={() => setSendEmail(!sendEmail)}
                >
                  <div className="relative mr-2 inline-block w-10 select-none align-middle transition duration-200 ease-in">
                    <input
                      type="checkbox"
                      name="toggle-user-email"
                      id="toggle-user-email"
                      checked={sendEmail}
                      onChange={() => setSendEmail(!sendEmail)}
                      className={`${
                        sendEmail
                          ? 'right-0 border-gray-500'
                          : 'border-gray-300'
                      } absolute block h-6 w-6 cursor-pointer appearance-none rounded-full border-4  bg-white`}
                    />
                    <label
                      htmlFor="toggle"
                      className={`${
                        sendEmail ? ' bg-gray-500' : 'bg-gray-300'
                      }  block h-6 cursor-pointer overflow-hidden rounded-full `}
                    ></label>
                  </div>
                  <label htmlFor="toggle-user-email">
                    Send order detail to my email
                  </label>
                </button>
              </div>
            </div>

            <Button
              value="Place Order"
              size="xl"
              extraClass={'w-full'}
              type="submit"
            />
          </div>
        </section>
      </form>
    </main>
  );
};

export default ShoppingCart;

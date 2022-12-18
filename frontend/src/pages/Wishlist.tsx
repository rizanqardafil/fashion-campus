import { HiOutlineChevronLeft } from 'react-icons/hi';
import { Link } from 'react-router-dom';

import GhostButton from '../components/button/GhostButton';
import { convertToCurrency } from '../components/util/utilFunc';
import { useWishlist } from '../context/WishlistContext';
const Wishlist = () => {
  const { wishlist, deleteWishlistItem, clearWishlist } = useWishlist();

  return (
    <main id="main-content" className="mx-auto mt-20 min-h-[60vh] max-w-7xl">
      {/* ===== Heading & Continue Shopping */}
      <div className="app-max-width w-full border-t-2 border-gray-100 px-4 sm:px-8 md:px-20">
        <h1 className="mt-6 mb-2 text-center text-2xl sm:text-left sm:text-4xl">
          Wishlist
        </h1>
        <div className="mt-6 mb-3 flex ">
          <Link to="/products" className="flex place-items-center  gap-x-2">
            <HiOutlineChevronLeft className="text-xl" /> Continue Shopping
          </Link>
        </div>
      </div>

      {/* ===== Wishlist Table Section ===== */}
      <div className="app-max-width mb-14 flex flex-col px-4 sm:px-8 md:px-20 lg:flex-row">
        <div className="h-full w-full">
          <table className="mb-6 w-full">
            <thead>
              <tr className="border-t-2 border-b-2 border-gray-200">
                <th className="hidden py-2 text-left font-normal sm:text-center md:table-cell xl:w-72">
                  Product Image
                </th>
                <th className="hidden py-2 text-left font-normal sm:text-center md:table-cell xl:w-72">
                  Product Name
                </th>
                <th className="max-w-xs py-2 text-center font-normal">
                  Unit Price
                </th>
                <th className="hidden  whitespace-nowrap py-2 text-center font-normal sm:table-cell">
                  Remove
                </th>
              </tr>
            </thead>
            <tbody>
              {wishlist.data.length === 0 ? (
                <tr className="h-60 w-full border-b-2 border-gray-200 text-center">
                  <td colSpan={5}>Whislist is empty!</td>
                </tr>
              ) : (
                wishlist.data.map((item) => {
                  return (
                    <tr className="border-b-2 border-gray-200" key={item.id}>
                      <td className="my-3 flex flex-col items-start justify-center sm:items-center">
                        <Link
                          to={`/products/${encodeURIComponent(
                            item.product_id
                          )}`}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            width={95}
                            height={128}
                            className="h-32 xl:mr-4"
                          />
                          <span className="text-xs md:hidden">
                            {item.title}
                          </span>
                        </Link>
                      </td>
                      <td className="hidden text-center md:table-cell">
                        <Link
                          to={`/products/${encodeURIComponent(
                            item.product_id
                          )}`}
                        >
                          {item.title}
                        </Link>
                      </td>
                      <td className="max-w-xs text-center text-gray-400">
                        {convertToCurrency(item.price)}
                      </td>
                      {/* <td className="hidden max-w-xs text-center text-gray-400 sm:table-cell">
                        <Button
                          value={'Add To Cart'}
                          extraClass="hidden sm:block m-auto"
                          onClick={() => {
                            // addCartItem?.mutate({
                            //   product_id: item.id,
                            //   quantity: 1,
                            //   size: item.size,
                            // });
                          }}
                        />
                        <AddToCart item={item} />
                      </td> */}
                      <td className="text-center">
                        {/* <Button
                          value={'add'}
                          // onClick={() => addOne!(item)}
                          extraClass="sm:hidden mb-4 whitespace-nowrap"
                        /> */}
                        <button
                          onClick={() =>
                            deleteWishlistItem!.mutate({
                              product_id: item.product_id,
                            })
                          }
                          type="button"
                          className="text-4xl text-gray-300 outline-none hover:text-gray-500 focus:outline-none sm:text-2xl"
                        >
                          &#10005;
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div>
            <GhostButton
              onClick={() => clearWishlist!.mutate()}
              extraClass="w-full sm:w-48 whitespace-nowrap"
            >
              Clear Wishlist
            </GhostButton>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Wishlist;

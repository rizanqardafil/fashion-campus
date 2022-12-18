import { useState } from 'react';
import { HiOutlineChevronLeft } from 'react-icons/hi';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { ApiError, CategoryService } from '../../api';
import Button from '../button/Button';
import Dropdown from '../input/Dropdown';
import Input from '../input/Input';

const categoryTypes = ['tops', 'bottoms', 'shoes & accessories'];

const Category: React.FC = () => {
  const { id } = useParams();
  const [category, setCategory] = useState('');
  const [categoryType, setCategoryType] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const updateCategory = useMutation(
    (variables: { id: string; title: string; type: string }) =>
      CategoryService.updateCategory(variables.id, {
        title: variables.title,
        type: variables.type,
      }),
    {
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries('categories').catch((err) => {
          console.log(err);
        });
      },
      onError: (error: ApiError) => {
        toast.error(error.body.message);
      },
    }
  );

  const fetchCategory = useQuery(
    ['category', id],
    () => CategoryService.getDetailCategory(id as string),
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setCategory(data.title);
        setCategoryType(data.type);
      },
    }
  );

  const deleteCategory = useMutation(
    (id: string) => CategoryService.deleteCategory(id),
    {
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries('categories').catch((err) => {
          console.log(err);
        });
        navigate('/admin/categories');
      },
      onError: (error) => {
        toast.error((error as ApiError).body.message);
      },
    }
  );

  const fetchCategories = useQuery(
    'categories',
    () => CategoryService.getCategory(),
    {
      staleTime: Infinity,
    }
  );

  if (
    fetchCategory.isLoading ||
    id === undefined ||
    fetchCategories.isLoading
  ) {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateCategory.mutate({ id, title: category, type: categoryType });
  };

  return (
    <>
      <h2 className="w-full text-2xl font-medium">Update Category</h2>
      <div className="flex py-3 ">
        <Link
          to="/admin/categories"
          className="flex place-items-center  gap-x-2"
        >
          <HiOutlineChevronLeft className="text-xl" />
          Go Back
        </Link>
      </div>
      <form
        className="information flex min-h-[32rem] w-full flex-col gap-y-4 py-4 text-lg text-gray-700"
        onSubmit={handleSubmit}
      >
        <div className="">
          <label htmlFor="categoryTitle" className="text-lg">
            Category Title
          </label>
          <Input
            name="categoryTitle"
            type="text"
            extraClass="w-full mt-1 mb-2"
            border="border-2 border-gray-400"
            value={category}
            onChange={(e) => setCategory((e.target as HTMLInputElement).value)}
            required
          />
        </div>
        <div className="">
          <div className="mb-2 text-lg">Category Type</div>
          <Dropdown
            selected={categoryType}
            setSelected={setCategoryType}
            width="w-64"
            options={categoryTypes}
          />
        </div>
        <div className="mt-8 flex place-content-between">
          <button
            type="button"
            onClick={() => deleteCategory.mutate(id)}
            className="mb-4 w-52 border border-gray-500 py-3 px-6 text-center text-xl hover:bg-gray-500  hover:text-gray-100 sm:py-2 sm:text-base"
            aria-label="Delete Category"
          >
            Delete Category
          </button>
          <Button
            type="submit"
            value="Update Category"
            extraClass="w-52 text-center text-xl mb-4"
            size="lg"
          />
        </div>
      </form>
    </>
  );
};

export default Category;

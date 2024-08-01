import { useAuth } from '@/context/Auth';
import { useState, useEffect } from 'react';
import axios from '@/api/axios';
import { toast, ToastContainer } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/layout/Header';
import 'react-toastify/dist/ReactToastify.css';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const url = user.role === 'user' ? 'faxes/my-faxes' : 'faxes';
    axios
      .get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setData(res?.data);
      })
      .catch((err) => {
        console.log(err);
        toast.error('حدث خطأ ');
      });
  }, [user.role]);

  const handleDelete = (id) => {
    const confirmDelete = () => {
      const token = localStorage.getItem('userToken');
      setLoading(true);

      axios
        .delete(`faxes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setData((prevData) => ({
            ...prevData,
            data: prevData.data.filter((item) => item._id !== id),
          }));
          toast.success('تم حذف الفاكس بنجاح');
        })
        .catch((err) => {
          console.log(err);
          toast.error('حدث خطأ أثناء الحذف');
        })
        .finally(() => {
          setLoading(false);
        });
    };

    toast(
      ({ closeToast }) => (
        <div>
          <p>هل أنت متأكد أنك تريد حذف هذا الفاكس؟</p>
          <button
            className="btn btn-danger mx-2"
            onClick={() => {
              confirmDelete();
              closeToast();
            }}
          >
            تأكيد
          </button>
          <button className="btn btn-secondary mx-2" onClick={closeToast}>
            إلغاء
          </button>
        </div>
      ),
      {
        autoClose: false,
      }
    );
  };

  const filteredData = data?.data?.filter((item) =>
    [
      item?.about?.subject?.destination?.name,
      item?.about?.subject?.name,
      item?.about?.name,
      item?.faxNumber,
      item?.faxType,
      item?.date,
    ]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const paginatedData = filteredData?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <ToastContainer />
      <div className="container shadow-none p-3 mt-3 mb-5 bg-body-light rounded main-title">
        <Header />
        <h2 className="fs-1 fw-bold text-light shadow p-3 mb-5 bg-body-light rounded text-center">
          جميع الفكسات
        </h2>
        {user.role === 'admin' && (
          <Link to={'/addNewFax'}>
            <button
              type="button"
              className="btn my-5 text-start d-block p-3 btn-secondary"
            >
              اضافة فاكس جديد
            </button>
          </Link>
        )}
        {user.role === 'user' && (
          <Link to={'/addNewFax'}>
            <button
              type="button"
              className="btn my-5 text-start d-block p-3 btn fw-bolder d-block ms-auto btn-secondary"
            >
              + اضافة فاكس جديد
            </button>
          </Link>
        )}
        <input
          className="form-control"
          id="search"
          placeholder="أكتب للبحث ..."
          onChange={(e) => setSearch(e.target.value)}
        />
        {paginatedData?.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table text-center table-hover text-dark p-5 my-5">
                <thead>
                  <tr>
                    <th className="p-4">#</th>
                    <th className="p-4">الجهة</th>
                    <th className="p-4">اسم المستخدم</th>
                    <th className="p-4">كود الفاكس</th>
                    <th className="p-4">نوع الفاكس</th>
                    <th className="p-4">التاريخ</th>
                    <th className="p-4">الاحداث</th>
                  </tr>
                </thead>
                <tbody className="text-center p-5">
                  {paginatedData?.map((item, index) => (
                    <tr key={item._id}>
                      <td className="p-3">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                      <td className="p-3">{item?.about?.name || 'غير محدد'}</td>
                      <td className="p-3">
                        {item?.user.username || 'غير محدد'}
                      </td>
                      <td className="p-3">{item?.faxNumber}</td>
                      <td className="p-3">{item?.faxType}</td>
                      <td className="p-3">{item?.date.slice(0, 10)}</td>
                      <td className="p-3">
                        {user.role === 'admin' && (
                          <Link to={`/update/${item._id}`} state={{ item }}>
                            <button className="btn btn-outline-success mx-2 px-4">
                              تعديل
                            </button>
                          </Link>
                        )}
                        <Link to={'/moredetails'} state={{ item }}>
                          <button className="btn btn-outline-info mx-2 px-4">
                            تفاصيل
                          </button>
                        </Link>
                        {user.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="btn btn-outline-danger mx-2 px-4"
                          >
                            حذف
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-primary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                السابق
              </button>
              <span className="mx-2">
                صفحة {currentPage} من {totalPages}
              </span>
              <button
                className="btn btn-primary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                التالي
              </button>
            </div>
          </>
        ) : (
          <h2 className="text-center text-light my-5">لا توجد فكسات متاحة</h2>
        )}
      </div>
    </>
  );
};

export default Home;

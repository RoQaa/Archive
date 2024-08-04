import { useAuth } from '@/context/Auth';
import { useState, useEffect, useCallback } from 'react';
import axios from '@/api/axios';
import { toast, ToastContainer } from 'react-toastify';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/layout/Header';
import 'react-toastify/dist/ReactToastify.css';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [usernameSearch, setUsernameSearch] = useState('');
  const [faxNumberSearch, setFaxNumberSearch] = useState('');
  const [faxTypeSearch, setFaxTypeSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Add error message state
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get location object

  const itemsPerPage = 10;

  // Function to fetch data
  const fetchData = useCallback(() => {
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
        setErrorMessage(''); // Clear any previous error message
      })
      .catch((err) => {
        console.log(err);
        toast.error('حدث خطأ ');
      });
  }, [user.role]);

  // Function to fetch search results
  // Function to fetch search results
  const fetchSearchResults = useCallback(async () => {
    const token = localStorage.getItem('userToken');
    const searchParams = new URLSearchParams();
    if (search) searchParams.append('destinationName', search);
    if (usernameSearch) searchParams.append('username', usernameSearch);
    if (faxNumberSearch) searchParams.append('fax_Number', faxNumberSearch);
    if (faxTypeSearch) searchParams.append('faxType', faxTypeSearch);
    if (startDate) searchParams.append('startDate', formatDate(startDate));
    if (endDate) searchParams.append('endDate', formatDate(endDate));

    let url = '';
    if (user.role === 'user') {
      url = `faxes/searchesByUser?${searchParams.toString()}`;
    } else {
      url = `faxes/searchesByAdmin?${searchParams.toString()}`;
      // Optionally, you can include other parameters specific to admin searches
    }

    try {
      const res = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setData(res.data);
      setErrorMessage(''); // Clear any previous error message
    } catch (err) {
      console.log(err);
      setErrorMessage('لا توجد بيانات لعرضها'); // Set error message
    }
  }, [
    search,
    usernameSearch,
    faxNumberSearch,
    faxTypeSearch,
    startDate,
    endDate,
    user.role,
  ]);

  // Refresh data on location change
  useEffect(() => {
    fetchData();
  }, [location, fetchData]);

  // Refresh search results on search/filter change
  useEffect(() => {
    if (
      search ||
      usernameSearch ||
      faxNumberSearch ||
      faxTypeSearch ||
      startDate ||
      endDate
    ) {
      fetchSearchResults();
    } else {
      fetchData();
    }
  }, [
    search,
    usernameSearch,
    faxNumberSearch,
    faxTypeSearch,
    startDate,
    endDate,
    fetchSearchResults,
    fetchData,
  ]);

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

  const handleViewDetails = (id) => {
    const token = localStorage.getItem('userToken');
    const url = `faxes/getOneUserFax/${id}`;

    axios
      .get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        navigate(`/details/${id}`, { state: { fax: res.data.fax[0] } });
      })
      .catch((err) => {
        console.log(err);
        toast.error('حدث خطأ أثناء جلب البيانات');
      });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleUsernameSearchChange = (e) => {
    setUsernameSearch(e.target.value);
  };

  const handleFaxNumberSearchChange = (e) => {
    setFaxNumberSearch(e.target.value);
  };

  const handleFaxTypeSearchChange = (e) => {
    setFaxTypeSearch(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const formatDate = (dateString) => {
    const dat = dateString.split('-');
    return `${dat[0]}-${dat[1]}-${dat[2]}`;
  };

  const filteredData = data?.data?.filter((item) =>
    [
      item?.about?.subject?.destination?.name,
      item?.user?.username,
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
              className="btn my-5 fw-bolder text-start d-block p-3 btn-primary"
            >
              + اضافة فاكس جديد
            </button>
          </Link>
        )}
        {user.role === 'user' && (
          <Link to={'/addNewFax'}>
            <button
              type="button"
              className="btn my-5 text-start d-block p-3 btn fw-bolder d-block ms-auto btn-primary"
            >
              + اضافة فاكس جديد
            </button>
          </Link>
        )}

        <form className="d-flex shadow-lg" role="search">
          <input
            className="form-control me-2"
            type="search"
            id="dest"
            placeholder="أكتب للبحث بأسم الجهة"
            aria-label="Search"
            value={search}
            onChange={handleSearchChange}
          />
          <input
            className="form-control me-2"
            type="search"
            id="user"
            placeholder="أكتب للبحث بأسم المستخدم "
            aria-label="Search"
            value={usernameSearch}
            onChange={handleUsernameSearchChange}
          />
          <input
            className="form-control me-2"
            type="search"
            id="code"
            placeholder="أكتب للبحث بكود الفاكس"
            aria-label="Search"
            value={faxNumberSearch}
            onChange={handleFaxNumberSearchChange}
          />
          <select
            className="form-control me-2"
            id="faxtype"
            value={faxTypeSearch}
            onChange={handleFaxTypeSearchChange}
          >
            <option value="">اختر نوع الفاكس</option>
            <option value="صادر">صادر</option>
            <option value="وارد">وارد</option>
          </select>
        </form>

        <div className="dateInput d-flex ">
          <label
            htmlFor=""
            className="fw-bolder me-1 d-flex justify-content-center align-items-center"
          >
            من
          </label>
          <input
            className="form-control me-3"
            type="date"
            id="startDate"
            value={startDate}
            onChange={handleStartDateChange}
            placeholder="أكتب للبحث بنوع الفاكس"
            aria-label="Search"
          />
          <label
            htmlFor=""
            className="fw-bolder ms-3 me-3 d-flex justify-content-center align-items-center"
          >
            إلي
          </label>
          <input
            className="form-control ms-3"
            type="date"
            id="endDate"
            value={endDate}
            onChange={handleEndDateChange}
            placeholder="أكتب للبحث بنوع الفاكس"
            aria-label="Search"
          />
        </div>

        {errorMessage ? (
          <h2 className="text-center text-light my-5">{errorMessage}</h2>
        ) : paginatedData?.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table text-center table-hover p-5 my-5">
                <thead className="table-headers">
                  <tr>
                    <th className="p-4 ">#</th>
                    <th className="p-4 table-headers">الجهة</th>
                    <th className="p-4 table-headers">اسم المستخدم</th>
                    <th className="p-4 table-headers">كود الفاكس</th>
                    <th className="p-4 table-headers">نوع الفاكس</th>
                    <th className="p-4 table-headers">التاريخ</th>
                    <th className="p-4 table-headers">الاحداث</th>
                  </tr>
                </thead>
                <tbody className="text-center p-5">
                  {paginatedData.map((item, index) => (
                    <tr key={item._id}>
                      <td className="p-3">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="p-3">
                        {item?.about?.subject?.destination?.name || 'غير محدد'}
                      </td>
                      <td className="p-3">
                        {item?.user?.username || 'غير محدد'}
                      </td>
                      <td className="p-3">{item?.faxNumber}</td>
                      <td className="p-3">{item?.faxType}</td>
                      <td className="p-3">{item?.date.slice(0, 10)}</td>
                      <td className="p-3">
                        {user.role === 'admin' && (
                          <Link to={`/update/${item._id}`} state={{ item }}>
                            <button className="btn btn-success mx-2 px-4">
                              تعديل
                            </button>
                          </Link>
                        )}
                        <Link to={'/moredetails'} state={{ item }}>
                          <button className="btn btn-info mx-2 px-4">
                            تفاصيل
                          </button>
                        </Link>
                        {user.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="btn btn-danger mx-2 px-4"
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
          <h2 className="text-center not-found text-light my-5">
            لا توجد فكسات متاحة
          </h2>
        )}
      </div>
    </>
  );
};

export default Home;

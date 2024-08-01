import { Header, SidebarDashboard } from '@/layout';
import axios from '@/api/axios';
import { MdOutlineArrowBack } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';

import { Link, useLocation, useNavigate } from 'react-router-dom';

const MoreDetails = () => {
  const navigate = useNavigate();
  const item = useLocation()?.state?.item;
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
  return (
    <div className="dashboard d-flex flex-row">
      <div className="container text-center">
        <div className="shadow-none p-3 mt-3 mb-5 bg-body rounded main-title">
          <Header />
          <h2 className="fs-1 fw-bold">تفاصيل المستخدم </h2>
        </div>
        <section style={{ backgroundColor: '#eee' }}>
          <div className="container py-5">
            <div className="row">
              <div className="col-lg-12">
                <div className="card mb-4">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-sm-3">
                        <p className="mb-0 fw-bolder"> الجهة </p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0 fw-bolder">
                          {item?.about.subject.destination.name}
                        </p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <p className="mb-0 fw-bolder">اسم المستخدم</p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0 fw-bolder">
                          {item?.user.username}
                        </p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <p className="mb-0 fw-bolder">الموضوع</p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0 fw-bolder">
                          {item?.about.subject.name}
                        </p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <p className="mb-0 fw-bolder">الشأن</p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0 fw-bolder">
                          {item?.about.name}
                        </p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3 ">
                        <p className="mb-0 fw-bolder">كود الفاكس</p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0 fw-bolder">
                          {item?.faxNumber}
                        </p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <p className="mb-0 fw-bolder">نوع الفاكس</p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0 fw-bolder">
                          {item?.faxType}
                        </p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <p className="mb-0 fw-bolder">التعليق</p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0 fw-bolder">
                          {item?.comment}
                        </p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <p className="mb-0 fw-bolder">التاريخ</p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0 fw-bolder">
                          {item?.date.slice(0, 10)}
                        </p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <p className="mb-0 fw-bolder">الملفات</p>
                      </div>
                      <div className="col-sm-9">
                        <button
                          onClick={() => handleViewDetails(item._id)}
                          className="btn btn-info mx-2 px-4"
                        >
                          عرض الملف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MoreDetails;

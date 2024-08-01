import { useState, useEffect } from 'react';
import axios from '@/api/axios';
import './Features.css';
import { Header } from '@/layout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Features = () => {
  const [destinations, setDestinations] = useState([]);
  const [newDestination, setNewDestination] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newAbout, setNewAbout] = useState('');
  const [token, setToken] = useState(localStorage.getItem('userToken'));
  const [destinationId, setDestinationId] = useState(null);
  const [subjectId, setSubjectId] = useState(null);
  const [isSubjectEnabled, setIsSubjectEnabled] = useState(false);
  const [isAboutEnabled, setIsAboutEnabled] = useState(false);

  useEffect(() => {
    axios
      .get('destinations', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setDestinations(res.data.data))
      .catch((err) => console.log(err));
  }, [token]);

  const handleConfirmDestination = () => {
    axios
      .post(
        'destinations/add',
        { name: newDestination },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.data.status) {
          setDestinationId(res.data.doc._id);
          setIsSubjectEnabled(true);
          toast.success('تم انشاء الجهة');
          console.log(res.data.doc._id);
          // window.location.reload(); // Reload the page to refresh the state
        } else {
          toast.error('حدث خطأ أثناء الإنشاء');
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error('حدث خطأ أثناء الإنشاء');
      });
  };

  const handleConfirmSubject = () => {
    if (!destinationId) {
      toast.error('الجهة غير محددة');
      return;
    }
    console.log(token);
    axios
      .post(
        'subjects/add',
        { name: newSubject, destination: destinationId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.data.status) {
          setSubjectId(res.data.doc._id);
          setIsAboutEnabled(true);
          toast.success('تم انشاء الموضوع');
          console.log(res.data.doc._id);
          // window.location.reload(); // Reload the page to refresh the state
        } else {
          toast.error('حدث خطأ أثناء الإنشاء');
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error('حدث خطأ أثناء الإنشاء');
      });
  };

  const handleConfirmAbout = () => {
    if (!subjectId) {
      toast.error('الموضوع غير محدد');
      return;
    }

    axios
      .post(
        'about/add',
        { name: newAbout, subject: subjectId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.data.status) {
          toast.success('تم انشاء البشان');
          // window.location.reload(); // Reload the page to refresh the state
        } else {
          toast.error('حدث خطأ أثناء الإنشاء');
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error('حدث خطأ أثناء الإنشاء');
      });
  };

  return (
    <div className="features-container bg-light text-center p-5">
      <div className="shadow-none p-3 mb-5 bg-body-light rounded main-title">
        <Header />
        <h2 className="fs-1 fw-bold text-light shadow p-3 my-5 bg-body-light rounded">
          اضافة خصائص
        </h2>
      </div>
      <div className="add-new-entry">
        <div className="d-flex flex-column mb-4">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="اضافة اسم الجهة"
            value={newDestination}
            onChange={(e) => setNewDestination(e.target.value)}
          />
          <button
            className="btn btn-secondary confirm-btn"
            onClick={handleConfirmDestination}
            disabled={!newDestination}
          >
            تأكيد
          </button>
        </div>
        <div className="d-flex flex-column mb-4">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="اضافة موضوع"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            disabled={!isSubjectEnabled}
          />
          <button
            className="btn btn-secondary confirm-btn"
            onClick={handleConfirmSubject}
            disabled={!newSubject || !isSubjectEnabled}
          >
            تأكيد
          </button>
        </div>
        <div className="d-flex flex-column mb-4">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="اضافة بشان"
            value={newAbout}
            onChange={(e) => setNewAbout(e.target.value)}
            disabled={!isAboutEnabled}
          />
          <button
            className="btn btn-secondary confirm-btn"
            onClick={handleConfirmAbout}
            disabled={!newAbout || !isAboutEnabled}
          >
            تأكيد
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Features;

import React, { useState, useEffect } from 'react';
import axios from '@/api/axios';
import './Features.css';
import { Header } from '@/layout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Custom confirmation toast component
const ConfirmToast = ({ message, onConfirm, onCancel }) => (
  <div>
    <p>{message}</p>
    <button className="btn btn-success" onClick={onConfirm}>
      تأكيد
    </button>
    <button className="btn btn-danger" onClick={onCancel}>
      الغاء
    </button>
  </div>
);

const Features = () => {
  const [destinations, setDestinations] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [abouts, setAbouts] = useState([]);

  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedAbout, setSelectedAbout] = useState('');

  const [newDestination, setNewDestination] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newAbout, setNewAbout] = useState('');

  const [token, setToken] = useState(localStorage.getItem('userToken'));
  const [userRole, setUserRole] = useState('');

  const [destinationId, setDestinationId] = useState(null);
  const [subjectId, setSubjectId] = useState(null);
  const [aboutId, setAboutId] = useState(null);

  const [isSubjectEnabled, setIsSubjectEnabled] = useState(false);
  const [isAboutEnabled, setIsAboutEnabled] = useState(false);

  const [isDestinationSelected, setIsDestinationSelected] = useState(false);
  const [isSubjectSelected, setIsSubjectSelected] = useState(false);
  const [isAboutSelected, setIsAboutSelected] = useState(false);

  const [isTypingNewDestination, setIsTypingNewDestination] = useState(false);

  const [IsTypingNewSubject, setIsTypingNewSubject] = useState('');
  // const [IsTypingNew, setIsTypingNewAbout] = useState('');

  useEffect(() => {
    axios
      .get('destinations', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setDestinations(res.data.data);
      })
      .catch((err) => console.log(err));
  }, [token]);

  useEffect(() => {
    if (selectedDestination) {
      axios
        .get(`subjects/${selectedDestination}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setSubjects(res.data.data);
        })
        .catch((err) => console.log(err));
    }
  }, [selectedDestination, token]);

  useEffect(() => {
    axios
      .get(`about/${selectedSubject}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAbouts(res.data.data);
      })
      .catch((err) => console.log(err));
  }, [selectedSubject, token]);

  useEffect(() => {
    axios
      .get('user/myProfile', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // console.log(res);
        setUserRole(res.data.data.role);
      })
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
          const newDest = { _id: res.data._id, name: newDestination };
          setDestinations([...destinations, newDest]); // Update destinations list
          setDestinationId(res.data._id);
          setIsSubjectEnabled(true);
          setIsDestinationSelected(true);
          toast.success('تم انشاء الجهة');
          setNewDestination(''); // Reset input field
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          toast.error('اسم الجهه موجود من قبل');
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error('اسم الجهه موجود من قبل');
      });
  };

  const handleConfirmSubject = () => {
    const selectedId = selectedDestination || destinationId;
    if (!selectedId) {
      toast.error('الجهة غير محددة');
      return;
    }

    // Show loading state
    const toastId = toast.loading('جارٍ إضافة الموضوع...');

    axios
      .post(
        'subjects/add',
        { name: newSubject, destination: selectedId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.dismiss(toastId);
        if (res.data.status) {
          // Update state immediately
          const newSubj = { _id: res.data.doc._id, name: newSubject };
          setSubjects((prevSubjects) => [...prevSubjects, newSubj]); // Update subjects list
          setSubjectId(res.data.doc._id);
          setIsAboutEnabled(true);
          setIsSubjectSelected(true);
          toast.success('تم انشاء الموضوع');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          setNewSubject(''); // Reset input field
        } else {
          toast.error('حدث خطأ أثناء الإنشاء');
        }
      })
      .catch((error) => {
        toast.dismiss(toastId);
        console.log(error);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      });
  };

  const handleConfirmAbout = () => {
    const selectedId = selectedSubject || subjectId;
    if (!selectedId) {
      toast.error('الموضوع غير محدد');
      return;
    }

    // Show loading state
    const toastId = toast.loading('جارٍ إضافة البشان...');

    axios
      .post(
        'about/add',
        { name: newAbout, subject: selectedId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.dismiss(toastId);
        if (res.data.status) {
          // Update state immediately
          const newAbt = { _id: res.data._id, name: newAbout };
          setAbouts((prevAbouts) => [...prevAbouts, newAbt]); // Update abouts list
          setIsAboutSelected(true);
          setNewAbout(''); // Reset input field
          toast.success('تم انشاء البشان');
        } else {
          toast.error('حدث خطأ أثناء الإنشاء');
        }
      })
      .catch((error) => {
        toast.dismiss(toastId);
        console.log(error);
        toast.error('حدث خطأ أثناء الإنشاء');
      });
  };

  const handleSelectDestination = (e) => {
    const selectedId = e.target.value;
    setSelectedDestination(selectedId);
    setIsDestinationSelected(!!selectedId);
    setIsTypingNewDestination();
    setIsSubjectEnabled(true);
    setDestinationId(selectedId);
    // Reset typing states and enable states for the next sections
    setIsTypingNewSubject(false);
    setIsTypingNewAbout(false);
    setIsSubjectEnabled(!!selectedId);
    setIsAboutEnabled(false);
  };

  const handleSelectSubject = (e) => {
    const selectedId = e.target.value;
    setSelectedSubject(selectedId);
    setIsSubjectSelected(!!selectedId);
    setIsAboutEnabled(true);
    setSubjectId(selectedId);
    // Reset typing state for the next section
    setIsTypingNewAbout(false);
  };

  const handleSelectAbout = (e) => {
    const selectedId = e.target.value;
    setSelectedAbout(selectedId);
    setIsAboutSelected(!!selectedId);
    setAboutId(selectedId);
  };

  const handleDestinationInputChange = (e) => {
    const value = e.target.value;
    setNewDestination(value);
    setIsTypingNewDestination(value.trim() !== '');

    if (value.trim() === '') {
      setIsSubjectEnabled(false);
      setIsAboutEnabled(false);
      setSelectedDestination('');
      setIsDestinationSelected(false);
    }
  };

  const handleSubjectInputChange = (e) => {
    const value = e.target.value;
    setNewSubject(value);
    setIsTypingNewSubject(value.trim() !== '');
    if (value.trim() === '') {
      setIsAboutEnabled(false);
      setSelectedSubject('');
      setIsSubjectSelected(false);
    }
  };

  const handleAboutInputChange = (e) => {
    const value = e.target.value;
    setNewAbout(value);
    if (value.trim() === '') {
      setSelectedAbout('');
      setIsAboutSelected(false);
    }
  };

  const handleEditDestination = () => {
    if (!selectedDestination) {
      toast.error('يرجى تحديد الجهة لتعديلها');
      return;
    }

    axios
      .patch(
        `destinations/${selectedDestination}`,
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
          toast.success('تم تعديل الجهة بنجاح');
          // Optionally, update state to reflect changes
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          toast.error(' اكتب اسم التعديل ');
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error(' اكتب الاسم للتعديل');
      });
  };

  const handleEditSubject = () => {
    if (!selectedSubject) {
      toast.error('يرجى تحديد الموضوع لتعديله');
      return;
    }
    axios
      .patch(
        `subjects/${selectedSubject}`,
        { name: newSubject },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.data.status) {
          toast.success('تم تعديل الموضوع بنجاح');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          // Optionally, update state to reflect changes
        } else {
          toast.error('حدث خطأ أثناء التعديل');
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error('حدث خطأ أثناء التعديل');
      });
  };

  const handleEditAbout = () => {
    if (!selectedAbout) {
      toast.error('يرجى تحديد البشان لتعديله');
      return;
    }
    axios
      .patch(
        `about/${selectedAbout}`,
        { name: newAbout },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.data.status) {
          toast.success('تم تعديل البشان بنجاح');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          // Optionally, update state to reflect changes
        } else {
          toast.error('حدث خطأ أثناء التعديل');
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error('حدث خطأ أثناء التعديل');
      });
  };

  const handleDeleteDestination = () => {
    if (!selectedDestination) {
      toast.error('يرجى تحديد الجهة لحذفها');
      return;
    }

    const confirmDelete = () => {
      const toastId = toast.loading('جارٍ حذف الجهة...');

      axios
        .delete(`destinations/${selectedDestination}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          toast.dismiss(toastId);
          if (res.data.status) {
            toast.success('تم حذف الجهة بنجاح');
            setDestinations((prevDestinations) =>
              prevDestinations.filter(
                (destination) => destination._id !== selectedDestination
              )
            );
            setSelectedDestination('');
            setDestinationId(null);
          } else {
            toast.error('حدث خطأ أثناء الحذف');
          }
        })
        .catch((error) => {
          toast.dismiss(toastId);
          console.log(error);
          toast.error('حدث خطأ أثناء الحذف');
        });
    };

    const cancelDelete = () => {
      toast.dismiss();
    };

    toast(
      <ConfirmToast
        message="سوف يتم حذف الجهة ومواضيعها وشئونها والفاكسات الخاصة بها؟"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    );
  };

  const handleDeleteSubject = () => {
    if (!selectedSubject) {
      toast.error('يرجى تحديد الموضوع لحذفه');
      return;
    }

    const confirmDelete = () => {
      const toastId = toast.loading('جارٍ حذف الموضوع...');

      axios
        .delete(`subjects/${selectedSubject}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          toast.dismiss(toastId);
          if (res.data.status) {
            toast.success('تم حذف الموضوع بنجاح');
            setSubjects((prevSubjects) =>
              prevSubjects.filter((subject) => subject._id !== selectedSubject)
            );
            setSelectedSubject('');
            setSubjectId(null);
          } else {
            toast.error('حدث خطأ أثناء الحذف');
          }
        })
        .catch((error) => {
          toast.dismiss(toastId);
          console.log(error);
          toast.error('حدث خطأ أثناء الحذف');
        });
    };

    const cancelDelete = () => {
      toast.dismiss();
    };

    toast(
      <ConfirmToast
        message="هل أنت متأكد أنك تريد حذف الموضوع؟"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    );
  };

  const handleDeleteAbout = () => {
    if (!selectedAbout) {
      toast.error('يرجى تحديد البشان لحذفه');
      return;
    }

    const confirmDelete = () => {
      const toastId = toast.loading('جارٍ حذف البشان...');

      axios
        .delete(`about/${selectedAbout}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          toast.dismiss(toastId);
          if (res.data.status) {
            toast.success('تم حذف البشان بنجاح');
            setAbouts((prevAbouts) =>
              prevAbouts.filter((about) => about._id !== selectedAbout)
            );
            setSelectedAbout('');
            setAboutId(null);
          } else {
            toast.error('حدث خطأ أثناء الحذف');
          }
        })
        .catch((error) => {
          toast.dismiss(toastId);
          console.log(error);
          toast.error('حدث خطأ أثناء الحذف');
        });
    };

    const cancelDelete = () => {
      toast.dismiss();
    };

    toast(
      <ConfirmToast
        message="هل أنت متأكد أنك تريد حذف البشان؟"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    );
  };
  return (
    <div className="features-container bg-light text-center p-5">
      <div className="shadow-none p-3 mb-5 bg-body-light rounded main-title">
        <Header />
        <h2 className="fs-1 fw-bold text-light shadow p-3 my-5 bg-body-light rounded">
          الخصائص
        </h2>
      </div>
      <div className="add-new-entry">
        <div className="d-flex flex-column mb-4">
          <select
            className="form-control mb-2"
            value={selectedDestination}
            onChange={handleSelectDestination}
          >
            <option value="">اختر جهة</option>
            {destinations.map((destination) => (
              <option key={destination._id} value={destination._id}>
                {destination.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="اضافة اسم جهة جديد"
            value={newDestination}
            onChange={handleDestinationInputChange}
          />
          <div className="btn-group">
            <button
              className="btn btn-primary confirm-btn"
              onClick={handleConfirmDestination}
              disabled={!isTypingNewDestination}
            >
              اضافة
            </button>
            {userRole !== 'user' && (
              <>
                <button
                  className="btn btn-success"
                  onClick={handleEditDestination}
                  disabled={!selectedDestination}
                >
                  تعديل
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteDestination}
                  disabled={!selectedDestination}
                >
                  حذف
                </button>
              </>
            )}
          </div>
        </div>

        <div className="d-flex flex-column mb-4">
          <select
            className="form-control mb-2"
            value={selectedSubject}
            onChange={handleSelectSubject}
            disabled={!isSubjectEnabled}
          >
            <option value="">اختر موضوع</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="اضافة اسم موضوع جديد"
            value={newSubject}
            onChange={handleSubjectInputChange}
            disabled={!isSubjectEnabled}
          />
          <div className="btn-group">
            <button
              className="btn btn-primary"
              onClick={handleConfirmSubject}
              disabled={!IsTypingNewSubject}
            >
              اضافة
            </button>
            {userRole !== 'user' && (
              <>
                <button
                  className="btn btn-success"
                  onClick={handleEditSubject}
                  disabled={!selectedSubject}
                >
                  تعديل
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteSubject}
                  disabled={!selectedSubject}
                >
                  حذف
                </button>
              </>
            )}
          </div>
        </div>

        <div className="d-flex flex-column mb-4">
          <select
            className="form-control mb-2"
            value={selectedAbout}
            onChange={handleSelectAbout}
            disabled={!isAboutEnabled}
          >
            <option value="">اختر بشان</option>
            {abouts.map((about) => (
              <option key={about._id} value={about._id}>
                {about.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="اضافة اسم بشان جديد"
            value={newAbout}
            onChange={handleAboutInputChange}
            disabled={!isAboutEnabled}
          />
          <div className="btn-group">
            <button
              className="btn btn-primary"
              onClick={handleConfirmAbout}
              disabled={!isAboutEnabled}
            >
              اضافة
            </button>
            {userRole !== 'user' && (
              <>
                <button
                  className="btn btn-success"
                  onClick={handleEditAbout}
                  disabled={!selectedAbout}
                >
                  تعديل
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteAbout}
                  disabled={!selectedAbout}
                >
                  حذف
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Features;

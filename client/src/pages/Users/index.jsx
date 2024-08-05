import { Header } from '@/layout';
import axios from '@/api/axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Modal from 'react-modal';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import './users.css';

const Users = () => {
  const { username } = useParams();
  const [data, setData] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState('');
  const [state, setstate] = useState(false)
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const token = localStorage.getItem('userToken');
    axios
      .get('user/getAllUsers', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setData(res.data);
        } else if (Array.isArray(res.data.data)) {
          setData(res.data.data);
        } else {
          toast.error('Unexpected data format');
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error('حدث خطأ');
      });
  };

  const openModal = (type, user = null) => {
    setSelectedUser(user);
    setModalType(type);
    if (type === 'editUser' && user) {
      setEditUsername(user.username);
      setEditRole(user.role);
    }
  };
  console.log('data', data);

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
    setPassword('');
    setPasswordConfirm('');
    setNewUsername('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setEditUsername('');
    setEditRole('');
  };

  const handlePasswordChange = () => {
    if (password !== passwordConfirm) {
      toast.error('كلمة المرور غير متشابهه');
      return;
    }

    const token = localStorage.getItem('userToken');
    axios
      .patch(
        `user/resetPassword/${selectedUser._id}`,
        { password, passwordConfirm },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.success('تم تعديل الرقم السري بنجاح');
        closeModal();
        fetchData();
      })
      .catch((err) => {
        console.log(err);
        toast.error('Failed to update password');
      });
  };

  const handleCreateUser = () => {
    if (newPassword !== newPasswordConfirm) {
      toast.error('كلمة المرور غير متشابهه');
      return;
    }

    const token = localStorage.getItem('userToken');
    axios
      .post(
        'user/createUser',
        {
          username: newUsername,
          password: newPassword,
          passwordConfirm: newPasswordConfirm,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.success('تم إنشاء المستخدم بنجاح');
        fetchData();
        closeModal();
      })
      .catch((err) => {
        if (err.response && err.response.data) {
          const errorResponse = err.response.data;
          // Handle username already exists error
          if (errorResponse.error && errorResponse.error.code === 11000) {
            toast.error('اسم المستخدم موجود من قبل');
          }
          // Handle password validation error
          else if (
            errorResponse.error &&
            errorResponse.error.errors &&
            errorResponse.error.errors.password &&
            errorResponse.error.errors.password.kind === 'minlength'
          ) {
            toast.error('الرقم السري يجب ان يكون علي الاقل 8 أحرف');
          } else {
            toast.error('الرقم السري يجب ان يكون علي الاقل 8 أحرف');
          }
        } else {
          console.log(err);
          toast.error('حدث خطأ أثناء إنشاء المستخدم');
        }
      });
  };

  const handleEditUser = () => {
    const token = localStorage.getItem('userToken');
    axios
      .patch(
        `user/updateUser/${selectedUser._id}`,
        {
          username: editUsername,
          role: editRole || 'user', // Set default role to 'user' if not specified
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.success('تم تعديل الحساب');
        closeModal();
        fetchData();
      })
      .catch((err) => {
        console.log(err.response.data);
        toast.error('يجب عليك تحديد دور المستخدم');
      });
  };

  const handleDelete = (userId) => {
    const confirmDelete = () => {
      const token = localStorage.getItem('userToken');
      axios
        .patch(`user/deleteUser/${userId}`,{
          active: state

        }, { //active = true ,false
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }

        },
        )
        .then((res) => {
          toast.success(res.data?.message);
          fetchData();
        })
        .catch((err) => {
          console.log(err);
          toast.error(err.response.data.message);
        });
    };

    toast(
      ({ closeToast }) => (
        <div>
          <p>هل أنت متأكد أنك تريد حذف هذا المستخدم؟</p>
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
  console.log(state);


  return (
    <div className="container bg-light text-center">
      <Header />
      <ToastContainer />
      <h2 className="text-center my-5 text-light fw-bolder shadow p-3 mb-5 rounded main-color">
        جميع المستخدمين
      </h2>
      <button
        type="button"
        onClick={() => openModal('newUser')}
        className="btn fw-bolder p-3 d-block ms-auto btn-primary"
      >
        + اضافة مستخدم جديد
      </button>
      <table className="table text-center table-hover text-light p-5 my-5">
        <thead>
          <tr>
            <th className="p-4">#</th>
            <th className="p-4">اسم المستخدم</th>
            <th className="p-4">الدور</th>
            <th className="p-4">الاحداث</th>
          </tr>
        </thead>
        <tbody className="text-center p-5">
          {data?.map((item, index) => (
            <tr key={item._id}>
              <td className="p-3">{index + 1}</td>
              <td className="p-3">{item.username}</td>
              <td className="p-3">
                {item.role === 'user' ? 'مستخدم' : 'مسئول'}
              </td>
              <td className="p-3">
                <button
                  onClick={() => openModal('password', item)}
                  className="btn btn-warning bt-c mx-2 px-4"
                >
                  تعديل كلمة السر
                </button>
                <button
                  onClick={() => openModal('editUser', item)}
                  className="btn btn-info bt-c mx-2 px-4"
                >
                  تعديل المستخدم
                </button>
                {item?.isActive == true ? (
                  <button
                    onClick={
                      () => {
                        setstate(false)
                        handleDelete(item._id)
                      }}
                    className="btn bt-d btn-success mx-2 px-4"
                  >
                    مفعل
                  </button>
                ) : (
                  <button
                    onClick={
                      () => {
                        setstate(true)
                        handleDelete(item._id)
                      }}
                    className="btn bt-d btn-danger mx-2 px-4"
                  >
                    غير مفعل
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {
        modalType === 'password' && (
          <Modal
            isOpen={true}
            onRequestClose={closeModal}
            contentLabel="Edit User Password"
            className="dark-mode-modal text-end container p-5"
            overlayClassName="dark-mode-overlay"
            style={{ overlay: { top: '10%' } }} // Position the modal from the top
            closeTimeoutMS={300}
          >
            <h2>تعديل كلمة المرور للمستخدم {selectedUser?.username}</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="password ms-auto">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="passwordConfirm">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  id="passwordConfirm"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="form-control"
                />
              </div>
              <button
                type="button"
                onClick={handlePasswordChange}
                className="btn btn-primary mt-3"
              >
                حفظ التعديلات
              </button>
            </form>
            <button onClick={closeModal} className="btn btn-danger mt-3">
              إلغاء
            </button>
          </Modal>
        )
      }
      {
        modalType === 'newUser' && (
          <Modal
            isOpen={true}
            onRequestClose={closeModal}
            contentLabel="Create New User"
            className="dark-mode-modal text-end container p-5"
            overlayClassName="dark-mode-overlay"
            style={{ overlay: { top: '10%' } }} // Position the modal from the top
            closeTimeoutMS={300}
          >
            <h2>إنشاء مستخدم جديد</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="newUsername">اسم المستخدم</label>
                <input
                  type="text"
                  id="newUsername"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">كلمة المرور</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPasswordConfirm">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  id="newPasswordConfirm"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="form-control"
                />
              </div>
              <button
                type="button"
                onClick={handleCreateUser}
                className="btn btn-primary mt-3"
              >
                إنشاء مستخدم
              </button>
            </form>
            <button onClick={closeModal} className="btn btn-danger mt-3">
              إلغاء
            </button>
          </Modal>
        )
      }
      {
        modalType === 'editUser' && (
          <Modal
            isOpen={true}
            onRequestClose={closeModal}
            contentLabel="Edit User"
            className="dark-mode-modal text-end container p-5"
            overlayClassName="dark-mode-overlay"
            style={{ overlay: { top: '10%' } }} // Position the modal from the top
            closeTimeoutMS={300}
          >
            <h2>تعديل المستخدم {selectedUser?.username}</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="editUsername">اسم المستخدم</label>
                <input
                  type="text"
                  id="editUsername"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="editRole">الدور</label>
                <select
                  id="editRole"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="form-control"
                >
                  <option value="user">مستخدم</option>
                  <option value="admin">مسئول</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleEditUser}
                className="btn btn-primary mt-3"
              >
                حفظ التعديلات
              </button>
            </form>
            <button onClick={closeModal} className="btn btn-danger mt-3">
              إلغاء
            </button>
          </Modal>
        )
      }
    </div >
  );
};

export default Users;

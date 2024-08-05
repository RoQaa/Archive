import { Header } from '@/layout';
import axios from '@/api/axios';
import React, { useEffect, useState } from 'react';
import { Await, useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './users.css';
  import 'react-toastify/dist/ReactToastify.css';

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
  const [state, setState] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const navigate = useNavigate()
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (userIdToDelete !== null) {
      handleDelete(userIdToDelete);
    }
  }, [state, userIdToDelete]);

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
        toast.error(err?.response?.data?.message)
        err?.response?.status == 401 ? (
          navigate('/')
        ) : null
      });
  };

  const openModal = (type, user = null) => {
    setSelectedUser(user);
    setModalType(type);
    if (type === 'editUser' && user) {
      setEditUsername(user.username);
      setEditRole(user?.role);
    }
          toast.info('تم الفتح اذهب للأسفل');

    // const openModal = (type, user = null) => {
    //   setSelectedUser(user);
    //   setModalType(type);
    //   if (type === 'editUser' && user) {
    //     setEditUsername(user.username);
    //     setEditRole(user?.role);
    //   }
    //   // Show toast message when modal is opened
    //   toast.info('تم الفتح اذهب للأسفل');
    // };
    
  };

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

  const handleDelete = async (userId) => {
    const token = localStorage.getItem('userToken');
    await axios
      .patch(`user/deleteUser/${userId}`, {
        active: state
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      })
      .then((res) => {
        fetchData();
        toast.success(res.data?.message);
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response.data.message);
      });
  };

  const confirmDelete = (userId, newState) => {
    setState(newState);
    setUserIdToDelete(userId);
  };

  return (


    

        // <Header />
    <div className="container bg-light text-center">
      <Header />
      <ToastContainer />
          
      <div className="container bg-light text-center">
        <ToastContainer />
        {/* Rest of your JSX */}
      </div>

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
                  onClick={() => {
                    openModal('password', item)
                  }}
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
                    onClick={() => confirmDelete(item._id, false)}
                    className="btn bt-d btn-success mx-2 px-4"
                  >
                    مفعل
                  </button>
                ) : (
                  <button
                    onClick={() => confirmDelete(item._id, true)}
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
            contentLabel="تعديل كلمة المرور"
            className="Modal text-end px-5"
            overlayClassName="Overlay"
          >
            <h2>تعديل كلمة السر للمستخدم: {selectedUser.username}</h2>
            <div className="form-group">
              <label>كلمة المرور الجديدة:</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>تأكيد كلمة المرور الجديدة:</label>
              <input
                type="password"
                className="form-control"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>
            <button onClick={handlePasswordChange} className="btn btn-primary">
              تعديل كلمة المرور
            </button>
            <button onClick={closeModal} className="btn btn-secondary">
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
            contentLabel="إضافة مستخدم جديد"
            className="Modal text-end px-5"
            overlayClassName="Overlay"
          >
            <h2>إضافة مستخدم جديد</h2>
            <div className="form-group">
              <label>اسم المستخدم:</label>
              <input
                type="text"
                className="form-control"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>كلمة المرور:</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>تأكيد كلمة المرور:</label>
              <input
                type="password"
                className="form-control"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
              />
            </div>
            <button onClick={handleCreateUser} className="btn btn-primary">
              إضافة مستخدم جديد
            </button>
            <button onClick={closeModal} className="btn btn-secondary">
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
            contentLabel="تعديل المستخدم"
            className="Modal text-end px-5"
            overlayClassName="Overlay"
          >
            <h2>تعديل المستخدم: {selectedUser.username}</h2>
            <div className="form-group">
              <label>اسم المستخدم:</label>
              <input
                type="text"
                className="form-control"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>الدور:</label>
              <select
                className="form-control"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
              >
                <option value="user">مستخدم</option>
                <option value="admin">مسئول</option>
              </select>
            </div>
            <button onClick={handleEditUser} className="btn btn-primary">
              تعديل المستخدم
            </button>
            <button onClick={closeModal} className="btn btn-secondary">
              إلغاء
            </button>
          </Modal>
        )
      }
    </div>
  );
};

export default Users;
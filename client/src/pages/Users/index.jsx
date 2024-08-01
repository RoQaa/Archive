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
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState('');

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

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedUser(null);
  };

  const openNewUserModal = () => {
    setIsNewUserModalOpen(true);
  };

  const closeNewUserModal = () => {
    setIsNewUserModalOpen(false);
    setNewUsername('');
    setNewPassword('');
    setNewPasswordConfirm('');
  };

  const openEditUserModal = (user) => {
    setSelectedUser(user);
    setEditUsername(user.username);
    setEditRole(user.role);
    setIsEditUserModalOpen(true);
  };

  const closeEditUserModal = () => {
    setIsEditUserModalOpen(false);
    setSelectedUser(null);
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
        closePasswordModal();
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
        closeNewUserModal();
      })
      .catch((err) => {
        console.log(err);
        toast.error('Password At least has 8 characters');
      });
  };

  const handleEditUser = () => {
    const token = localStorage.getItem('userToken');
    axios
      .patch(
        `user/updateUser/${selectedUser._id}`,
        {
          username: editUsername,
          role: editRole,
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
        closeEditUserModal();
        fetchData();
      })
      .catch((err) => {
        console.log(err.response.data);
        toast.error('Failed to update user');
      });
  };

  const handleDelete = (userId) => {
    const confirmDelete = () => {
      const token = localStorage.getItem('userToken');
      axios
        .delete(`user/deleteUser/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          toast.success('تم حذف المستخدم بنجاح');
          fetchData();
        })
        .catch((err) => {
          console.log(err);
          toast.error('Failed to delete user');
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

  return (
    <div className="container bg-light text-center">
      <Header />
      <ToastContainer />
      <h2 className="text-center my-5 text-light fw-bolder shadow p-3 mb-5 rounded main-color">
        جميع المستخدمين
      </h2>
      <button
        type="button"
        onClick={openNewUserModal}
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
                {item.role == 'user' ? 'مستخدم' : 'مسئول'}
              </td>
              <td className="p-3">
                <button
                  onClick={() => openPasswordModal(item)}
                  className="btn btn-outline-success bt-c mx-2 px-4"
                >
                  تعديل كلمة السر
                </button>
                <button
                  onClick={() => openEditUserModal(item)}
                  className="btn btn-outline-info bt-c mx-2 px-4"
                >
                  تعديل المستخدم
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="btn bt-d btn-outline-danger mx-2 px-4"
                >
                  حذف المستخدم
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isPasswordModalOpen && (
        <Modal
          isOpen={isPasswordModalOpen}
          onRequestClose={closePasswordModal}
          contentLabel="Edit User Password"
          className="dark-mode-modal text-end container p-5"
          overlayClassName="dark-mode-overlay"
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
          <button
            onClick={closePasswordModal}
            className="btn btn-secondary mt-3"
          >
            إلغاء
          </button>
        </Modal>
      )}
      {isNewUserModalOpen && (
        <Modal
          isOpen={isNewUserModalOpen}
          onRequestClose={closeNewUserModal}
          contentLabel="Create New User"
          className="dark-mode-modal text-end container p-5"
          overlayClassName="dark-mode-overlay"
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
          <button
            onClick={closeNewUserModal}
            className="btn btn-secondary mt-3"
          >
            إلغاء
          </button>
        </Modal>
      )}
      {isEditUserModalOpen && (
        <Modal
          isOpen={isEditUserModalOpen}
          onRequestClose={closeEditUserModal}
          contentLabel="Edit User"
          className="dark-mode-modal text-end container p-5"
          overlayClassName="dark-mode-overlay"
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
          <button
            onClick={closeEditUserModal}
            className="btn btn-secondary mt-3"
          >
            إلغاء
          </button>
        </Modal>
      )}
    </div>
  );
};

export default Users;

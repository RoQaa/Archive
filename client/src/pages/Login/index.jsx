import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '@/api/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './login.scss';
import { useAuth } from '@/context/Auth';

const Login = () => {
  const { user, setuser } = useAuth();
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const [userName, setuserName] = useState('');
  const [password, setPassword] = useState('');

  const handelSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const { data } = await axios.post(
        'user/login',
        {
          username: userName,
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success('تم تسجيل الدخول بنجاح');
      setuser(data.data);
      localStorage.setItem('userToken', data.token);
      setIsPending(false);
      if (
        data.data.role === 'admin' ||
        data.data.role === 'godAdmin' ||
        data.data.role === 'manager'
      ) {
        navigate('/');
      }
    } catch (err) {
      console.log(err);
      setIsPending(false);
      toast.error('من فضلك تأكد من اسم المستخدم او كلمة المرور ');
    }
  };

  return (
    <>
      {isPending && <div className="loading"></div>}
      <div className="login-page">
        <div className="container pt-5 login">
          <div className="card-container">
            <div className="p-3 mb-5 bg-body-dark p-5 rounded login-card">
              <h3 className="text-center text-light pt-3 fs-2 fw-bold">
                أرشيف دار المشاه
              </h3>
              <h3 className="text-center text-light pt-3 fs-2 fw-bold">
                تسجيل الدخول
              </h3>
              <form className="p-5 shadow-none" onSubmit={handelSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="exampleInputuserName1"
                    className="form-label d-block ms-auto fs-4 fw-bold"
                  >
                    اسم المستخدم
                  </label>
                  <input
                    required
                    type="text"
                    className="form-control"
                    id="exampleInputuserName1"
                    aria-describedby="userNameHelp"
                    value={userName}
                    onChange={(e) => setuserName(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="exampleInputPassword1"
                    className="form-label fs-4 fw-bold"
                  >
                    كلمه المرور*
                  </label>
                  <input
                    required
                    type="password"
                    className="form-control fw-bold"
                    id="exampleInputPassword1"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="d-grid gap-2">
                  <ToastContainer />
                  <button type="submit" className="btn btn-primary">
                    تسجيل الدخول
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

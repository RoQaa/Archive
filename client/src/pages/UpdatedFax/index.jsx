import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import axios from '@/api/axios';

const UpdatedFax = () => {
  const navigate = useNavigate();
  const item = useLocation()?.state?.item;
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState(item?.comment);
  const [files, setFiles] = useState([]);
  const [fileUploadError, setFileUploadError] = useState('');

  const token = localStorage.getItem('userToken');

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return [];

    const formData = new FormData();
    if (files.length === 1) {
      formData.append('file', files[0]);
    } else {
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
    }

    const url =
      files.length === 1 ? '/uploads/uploadSingle' : '/uploads/uploadMultiple';

    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.status === 'success') {
        if (files.length === 1) {
          return [response.data.data.file.path];
        } else {
          return response.data.data.files.map((file) => file.path);
        }
      } else {
        throw new Error('File upload failed');
      }
    } catch (error) {
      console.error(error);
      setFileUploadError('Failed to upload files');
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fileUploadPaths = await uploadFiles();
    const updateData = {
      comment: comment || item?.comment,
      about: item?.about?._id,
    };

    if (fileUploadPaths.length > 0) {
      updateData.files = fileUploadPaths;
    }

    axios
      .patch(`faxes/${item?._id}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log(JSON.stringify(response.data));
        setLoading(false);
        navigate('/'); // Redirect to faxes page on success
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  };

  return (
    <div className="dashboard d-flex flex-row">
      <div className="container text-center">
        <div className="shadow-none p-3 mt-3 mb-5 bg-body-dark rounded main-title">
          <h2 className="fs-1 fw-bold text-light shadow-lg p-3 mb-5 bg-body-dark rounded">
            تعديل
          </h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="container d-flex flex-row justify-content-center align-content-center flex-wrap my-4"
        >
          <div className="col-12 text-end fw-bold fs-5 mb-4">
            <label htmlFor="comment" className="form-label">
              تعليق
            </label>
            <input
              name="comment"
              type="text"
              className="form-control"
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اضف تعليق"
            />
          </div>
          <div className="col-12 text-end fw-bold fs-5 mb-4">
            <label htmlFor="files" className="form-label">
              ملف الفاكس
            </label>
            <input
              name="files"
              type="file"
              className="form-control"
              id="files"
              onChange={handleFileChange}
              multiple
            />
          </div>

          {fileUploadError && (
            <div className="text-danger mb-4">{fileUploadError}</div>
          )}

          {!loading && (
            <button
              type="submit"
              className="d-grid col-3 py-3 fs-4 fw-bold align-content-center mx-auto btn btn-primary  mb-4"
            >
              تعديل بيانات
            </button>
          )}
          {loading && (
            <button className="d-grid col-3 py-3 fs-4 fw-bold align-content-center mx-auto btn btn-outline-primary mb-4">
              جاري التعديل ...
            </button>
          )}
          <button
            onClick={() => navigate(`/`)}
            className="d-grid col-3 py-3 fs-4 fw-bold align-content-center mx-auto btn btn-danger mb-4"
          >
            الغاء
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatedFax;

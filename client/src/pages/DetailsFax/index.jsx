import './detailsFax.scss';
import React, { useEffect, useState } from 'react';
import axios from '@/api/axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { Header } from '@/layout';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');

const DetailsFax = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [fax, setFax] = useState(location.state?.fax || null);
  const [loading, setLoading] = useState(!fax);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const token = localStorage.getItem('userToken');

  useEffect(() => {
    if (!fax) {
      const fetchFaxDetails = async () => {
        try {
          const response = await axios.get(`faxes/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setFax(response.data.fax);
          console.log('Fetched Fax Details:', response.data.fax);
        } catch (error) {
          if (error.response && error.response.status === 401) {
            toast.error(error?.response?.data?.message)
            setError('Unauthorized. Please log in again.')

            error?.response?.status == 401 ? (
              navigate('/')
            ) : null
          } else if (error.response && error.response.status === 500) {
            setError('Internal server error. Please try again later.');
          } else {
            setError('Failed to fetch fax details.');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchFaxDetails();
    } else {
      setLoading(false);
      console.log('Initial Fax Details:', fax);
    }
  }, [id, fax, token, navigate]);

  const openModal = (file) => {
    setCurrentFile(file);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentFile(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="details-fax-container container">
      <Header />
      <h2 className="text-light text-center fw-bolder">ملحقات الفاكس</h2>
      <div className="fax-files">
        {fax?.files?.length > 0 ? (
          <div className="files-scroll-container">
            {fax.files.map((file, index) => (
              <div key={index} className="fax-file-item">
                <div
                  className="fax-file-preview"
                  onClick={() => openModal(file)}
                >
                  {file?.endsWith('.jpg') ||
                    file?.endsWith('.jpeg') ||
                    file?.endsWith('.png') ? (
                    <img
                      src={`${import.meta.env.VITE_MAIN_IMAGE}${file}`}
                      alt={`fax-file-${index + 1}`}
                      className="fax-file-image"
                    />
                  ) : (
                    <div className="file-icon">
                      <i className="fa fa-file" aria-hidden="true"></i>
                      <p className="text-dark">
                        {file.split('.').pop().toUpperCase()} File
                      </p>
                    </div>
                  )}
                </div>
                <a
                  href={`${import.meta.env.VITE_MAIN_IMAGE}${file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-button"
                >
                  مراجعة الملف {index + 1}
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-dark fw-bolder text-center fs-3 mt-5">
            لا توجد ملفات
          </p>
        )}
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="File Preview"
        className="file-modal"
        overlayClassName="file-modal-overlay"
      >
        <button onClick={closeModal} className="close-modal-button">
          X
        </button>
        {currentFile && (
          <div className="file-preview-container">
            {currentFile?.endsWith('.jpg') ||
              currentFile?.endsWith('.jpeg') ||
              currentFile?.endsWith('.png') ? (
              <img
                src={`${import.meta.env.VITE_MAIN_IMAGE}${currentFile}`}
                alt="File preview"
                className="file-preview-image"
              />
            ) : currentFile?.endsWith('.pdf') ? (
              <embed
                src={`${import.meta.env.VITE_MAIN_IMAGE}${currentFile}`}
                type="application/pdf"
                width="100%"
                height="600px"
              />
            ) : (
              <p>
                Preview not available for this file type. Please download to
                view.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DetailsFax;

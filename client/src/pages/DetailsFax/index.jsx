import './detailsFax.scss';
import React, { useEffect, useState } from 'react';
import axios from '@/api/axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

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
          const response = await axios.get(`faxes/getOneUserFax/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setFax(response.data.fax[0]);
          console.log('Fetched Fax Details:', response.data.fax[0]);
        } catch (error) {
          if (error.response && error.response.status === 401) {
            setError('Unauthorized. Please log in again.');
            navigate('/auth/login');
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
    <div className="details-fax-container">
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
                      src={`http://${file}`}
                      alt={`fax-file-${index + 1}`}
                      className="fax-file-image"
                    />
                  ) : (
                    <div className="file-icon">
                      <i className="fa fa-file" aria-hidden="true"></i>
                      <p>{file.split('.').pop().toUpperCase()} File</p>
                    </div>
                  )}
                </div>
                <a
                  href={`http://${file}`}
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
          <p>لا توجد ملفات</p>
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
                src={`http://${currentFile}`}
                alt="File preview"
                className="file-preview-image"
              />
            ) : currentFile?.endsWith('.pdf') ? (
              <embed
                src={`http://${currentFile}`}
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

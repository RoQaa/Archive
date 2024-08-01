import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from '@/api/axios';
import './AddNewFax.css';
import { Header } from '@/layout';

const AddNewFax = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [destinationId, setDestinationId] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [abouts, setAbouts] = useState([]);
  const [allAbouts, setAllAbouts] = useState([]);
  const [comment, setComment] = useState('');
  const [faxNumber, setFaxNumber] = useState('');
  const [faxType, setFaxType] = useState('');
  const [about, setAbout] = useState('');
  const [files, setFiles] = useState([]);
  const [fileUploadError, setFileUploadError] = useState('');
  const [isDestinationSelected, setIsDestinationSelected] = useState(false);

  const token = localStorage.getItem('userToken');

  useEffect(() => {
    axios
      .get('destinations', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setDestinations(res?.data.data);
        setDestinationId = res.data._id;
      })
      .catch((err) => {
        console.log(err);
      });
    /*
    // Load all subjects and abouts initially
    axios
      .get('subjects', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAllSubjects(res?.data.data);
        setSubjects(res?.data.data);
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get('about', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAllAbouts(res?.data.data);
        setAbouts(res?.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
      */
  }, [token]);

  const handleDestinationChange = (e) => {
    const destinationId = e.target.value;
    setSelectedDestination(destinationId);
    setIsDestinationSelected(!!destinationId);

    if (destinationId) {
      axios
        .get(`subjects/${destinationId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const relatedSubjects = res?.data.data;
          setSubjects(
            relatedSubjects.length > 0 ? relatedSubjects : allSubjects
          );
          setSelectedSubject('');
          setAbouts([]);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setSubjects(allSubjects);
      setSelectedSubject('');
      setAbouts([]);
    }
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);

    if (subjectId) {
      axios
        .get(`about/${subjectId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const relatedAbouts = res?.data.data;
          setAbouts(relatedAbouts.length > 0 ? relatedAbouts : allAbouts);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setAbouts(allAbouts);
    }
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const uploadFiles = async () => {
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

  const handelSubmt = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fileUploadPaths = await uploadFiles();
    if (fileUploadPaths.length === 0) {
      setLoading(false);
      return;
    }

    axios
      .post(
        'faxes/add',
        {
          comment,
          faxNumber,
          faxType,
          files: fileUploadPaths,
          about,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
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
      <div className="container bg-light text-center">
        <Header />
        <div className="shadow-none p-3 mt-3 mb-5 bg-body-dark rounded main-title">
          <h2 className="fs-1 fw-bolder text-light shadow p-3 mb-5 bg-body-dark rounded">
            اضافة فاكس جديد
          </h2>
        </div>

        <div className="drop-down mb-5 d-flex justify-content-between align-items-center">
          <select
            className="form-select ms-3"
            aria-label="Default select example"
            onChange={handleDestinationChange}
            onBlur={() => setIsDestinationSelected(!!selectedDestination)}
            value={selectedDestination}
          >
            <option value="">اسم الجهة</option>
            {destinations.map((destination) => (
              <option key={destination._id} value={destination._id}>
                {destination.name}
              </option>
            ))}
          </select>
          <select
            className="form-select ms-3"
            aria-label="Default select example"
            onChange={handleSubjectChange}
            value={selectedSubject}
            disabled={!isDestinationSelected}
          >
            <option value="">الموضوع</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
          <select
            className="form-select"
            aria-label="Default select example"
            onChange={(e) => setAbout(e.target.value)}
            value={about}
            disabled={!isDestinationSelected || !selectedSubject}
          >
            <option value="">بشان</option>
            {abouts.map((aboutItem) => (
              <option key={aboutItem._id} value={aboutItem._id}>
                {aboutItem.name}
              </option>
            ))}
          </select>
        </div>

        <form
          onSubmit={handelSubmt}
          className="container d-flex justify-content-center align-items-center flex-wrap my-4"
        >
          <div className="col-12 text-end fw-bold fs-5 mb-4">
            <label htmlFor="input1" className="form-label">
              رقم الفاكس
            </label>
            <input
              name="input1"
              type="text"
              className="form-control"
              id="input1"
              required
              value={faxNumber}
              onChange={(e) => setFaxNumber(e.target.value)}
              placeholder="اضف رقم الفاكس*"
            />
          </div>
          <div className="col-12 text-end fw-bold fs-5 mb-4">
            <label htmlFor="input1" className="form-label">
              نوع الفاكس
            </label>
            <select
              name="input1"
              className="form-control"
              id="input1"
              required
              value={faxType}
              onChange={(e) => setFaxType(e.target.value)}
            >
              <option value="">اختر نوع الفاكس</option>
              <option value="صادر">صادر</option>
              <option value="وارد">وارد</option>
            </select>
          </div>
          <div className="col-12 text-end fw-bold fs-5 mb-4">
            <label htmlFor="input1" className="form-label">
              تعليق
            </label>
            <input
              name="input1"
              type="text"
              className="form-control"
              id="input1"
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اضف تعليق*"
            />
          </div>
          <div className="col-12 text-end fw-bold fs-5 mb-4">
            <label htmlFor="input1" className="form-label">
              ملف الفاكس
            </label>
            <input
              name="input1"
              type="file"
              className="form-control"
              id="input1"
              required
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
              اضافة
            </button>
          )}
          {loading && (
            <button className="d-grid col-3 py-3 fs-4 fw-bold align-content-center mx-auto btn btn-outline-primary mb-4">
              جاري الاضافة ...
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

export default AddNewFax;

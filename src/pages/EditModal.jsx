const EditModal = ({ currentEdit, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: currentEdit?.name || "",
    surname: currentEdit?.surname || "",
    email: currentEdit?.email || "",
    description: currentEdit?.description || "",
    birthDate: currentEdit?.birthDate?.split("T")[0] || "",
    profile: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profile: e.target.files[0] });
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("surname", formData.surname);
    data.append("email", formData.email);
    data.append("description", formData.description);
    data.append("birthDate", formData.birthDate);
    if (formData.profile) data.append("profile", formData.profile);

    try {
      await axios.put(
        `http://localhost:5274/api/user/doctors/${currentEdit.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Doctor updated successfully");
      onSave(formData); // Update parent state
    } catch (error) {
      toast.error("Failed to update doctor");
    } finally {
      onClose();
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit {currentEdit.name}</h2>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
        />
        <input
          name="surname"
          value={formData.surname}
          onChange={handleChange}
          placeholder="Surname"
        />
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
        />
        <input
          name="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={handleChange}
        />
        <input name="profile" type="file" onChange={handleFileChange} />
        <button onClick={handleSubmit}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default EditModal;

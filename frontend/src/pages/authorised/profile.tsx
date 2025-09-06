import i18n from "i18next";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getUserProfile,
  updateProfileField,
  uploadProfilePicture,
} from "../../service/userService";
import { UserProfile } from "../../service/interface";
import validator from "validator";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (field: string, value: string) => {
    if (!validator.isAlphanumeric(value) && field !== "dateOfBirth") {
      alert(t("FIELD_NOT_ALLOWED"));
      return;
    }

    if (field === "dateOfBirth") {
      if (isNaN(Date.parse(value))) {
        alert(t("INVALID_DATE"));
        return;
      }
    }

    updateProfileField(field, value)
      .then(() => {
        if (field === "language") {
          i18n.changeLanguage(value);
          localStorage.setItem("language", value);
        }
        alert(t("SUCCESS"));
      })
      .catch(() => alert(t("FIELD_NOT_ALLOWED")));
  };

  if (loading || !profile) return <div></div>;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedMimeTypes = ["image/jpeg", "image/png"];
    if (!allowedMimeTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a valid image file (JPEG, PNG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5 MB limit
      alert("File size exceeds the limit of 5 MB.");
      return;
    }
    try {
      const result = await uploadProfilePicture(file);
      setTimeout(() => {
        setProfile({ ...profile, profilePic: result.profilePic });
      }, 500);
    } catch (err) {
      console.error("Failed to upload avatar", err);
    }
  };

  return (
    <div className="w-full h-full min-h-screen text-white relative p-8">
      <button
        onClick={() => navigate("/menu")}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        🔙 {t("BACK_TO_MENU")}
      </button>

      <div className="bg-black bg-opacity-70 backdrop-blur-md p-8 rounded-xl max-w-5xl mx-auto mt-20">
        <h1 className="text-4xl font-bold mb-6 text-center">
          {t("PROFILE_BUTTON")}
        </h1>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="text-center">
            <img
              src={profile.profilePic || "/profile-pics/default-profile.jpg"}
              alt="avatar"
              className="w-40 h-40 rounded-full border-4 border-white object-cover mx-auto"
            />
            <input
              type="file"
              onChange={handleAvatarChange}
              className="mt-4 text-sm"
            />
          </div>

          <div className="text-left">
            <p className="text-xl">
              <strong>{t("USERNAME")}:</strong> {profile.username}
            </p>
            <p className="text-xl mt-2">
              <strong>{t("EMAIL")}:</strong> {profile.email}
            </p>
            <p className="text-xl mt-2">
              <strong>{t("WINS")}:</strong> {profile.wins}
            </p>
            <p className="text-xl mt-2">
              <strong>{t("LOSSES")}:</strong> {profile.losses}
            </p>
          </div>
        </div>

        <hr className="my-6 border-gray-600" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
          <EditableField
            label="firstName"
            value={profile.firstName || ""}
            onUpdate={handleUpdate}
          />
          <EditableField
            label="lastName"
            value={profile.lastName || ""}
            onUpdate={handleUpdate}
          />
          <EditableField
            label="dateOfBirth"
            value={profile.dateOfBirth || ""}
            onUpdate={handleUpdate}
            type="date"
          />

          <SelectField
            label="gender"
            value={profile.gender}
            options={[
              { value: "male", label: "GENDER_MALE" },
              { value: "female", label: "GENDER_FEMALE" },
              { value: "other", label: "GENDER_OTHER" },
            ]}
            onUpdate={handleUpdate}
          />

          <SelectField
            label="language"
            value={profile.language}
            options={[
              { value: "english", label: "LANGUAGE_ENGLISH" },
              { value: "finnish", label: "LANGUAGE_FINNISH" },
              { value: "serbian", label: "LANGUAGE_SERBIAN" },
              { value: "russian", label: "LANGUAGE_RUSSIAN" },
            ]}
            onUpdate={handleUpdate}
          />
          <SelectField
            label="favAvatar"
            value={profile.favAvatar}
            options={[
              "None",
              "QueenOfTheSpoons",
              "JustBorn",
              "Maslina",
              "BossLady",
              "Inka",
              "Burek",
              "Fish",
              "WarMachine",
              "Finn",
              "GangGanger",
              "StabIlity",
              "VampBoy",
            ].map((key) => ({ value: key, label: key }))}
            onUpdate={handleUpdate}
          />
        </div>
      </div>
    </div>
  );
};

const EditableField = ({
  label,
  value,
  onUpdate,
  type = "text",
}: {
  label: string;
  value: string;
  onUpdate: (field: string, value: string) => void;
  type?: string;
}) => {
  const [inputValue, setInputValue] = useState(value);
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-white mb-1 capitalize">
        {t(`LABEL_${label.replace(/([A-Z])/g, "_$1").toUpperCase()}`)}
      </label>
      <div className="flex gap-2">
        <input
          type={type}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full p-2 rounded bg-white text-black"
        />
        <button
          onClick={() => onUpdate(label, inputValue)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
        >
          {t("UPDATE") || "Update"}
        </button>
      </div>
    </div>
  );
};

type Option = { value: string; label: string };

const SelectField = ({
  label,
  value,
  options,
  onUpdate,
}: {
  label: string;
  value: string;
  options: Option[];
  onUpdate: (field: string, value: string) => void;
}) => {
  const [selected, setSelected] = useState(value);
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-white mb-1 capitalize">
        {t(`LABEL_${label.replace(/([A-Z])/g, "_$1").toUpperCase()}`)}
      </label>
      <div className="flex gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full p-2 rounded bg-white text-black"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.label)}
            </option>
          ))}
        </select>
        <button
          onClick={() => onUpdate(label, selected)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
        >
          {t("UPDATE") || "Update"}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;

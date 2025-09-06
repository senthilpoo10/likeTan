import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserProfile } from "../../service/interface";
import { appClient } from "../../service";

export const UserProfilePage = () => {
  const { t } = useTranslation();
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    appClient
      .get(`/get-public-profile/${username}`)
      .then((res) => setProfile(res.data))
      .catch((err) => {
        console.error("Failed to load user profile:", err);
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div className="text-white p-8">{t("LOADING")}</div>;
  if (!profile)
    return <div className="text-red-500 p-8">{t("USER_NOT_FOUND")}</div>;

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center text-white relative p-8"
      style={{ backgroundImage: "url('/background/gray_background.jpg')" }}
    >
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        🔙 {t("BACK")}
      </button>

      <div className="bg-black bg-opacity-70 backdrop-blur-md p-8 rounded-xl max-w-5xl mx-auto mt-20">
        <h1 className="text-4xl font-bold mb-6 text-center">
          {t("GANG_PROFILE")}: {profile.username}
        </h1>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="text-center">
            <img
              src={profile.profilePic || "/profile-pics/default-profile.jpg"}
              alt="avatar"
              className="w-40 h-40 rounded-full border-4 border-white object-cover mx-auto"
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
            <p className="text-xl mt-2">
              <strong>{t("FIRST_NAME")}:</strong> {profile.firstName || "N/A"}
            </p>
            <p className="text-xl mt-2">
              <strong>{t("LAST_NAME")}:</strong> {profile.lastName || "N/A"}
            </p>
            <p className="text-xl mt-2">
              <strong>{t("BIRTH_DATE")}:</strong> {profile.dateOfBirth || "N/A"}
            </p>
            <p className="text-xl mt-2">
              <strong>{t("GENDER")}:</strong> {profile.gender}
            </p>
            <p className="text-xl mt-2">
              <strong>{t("LANGUAGE")}:</strong> {profile.language}
            </p>
            <p className="text-xl mt-2">
              <strong>{t("FAV_AVATAR")}:</strong> {profile.favAvatar}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;

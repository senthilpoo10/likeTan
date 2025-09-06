import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Avatar {
  name: string;
  image: string;
  description: string;
}

export const avatars: Avatar[] = [
  {
    name: "QueenOfTheSpoons",
    image: "/avatars/queen_of_spoons/6f6e1f9c-7ea1-4902-a844-a3292cc6954d.png",
    description: "AVATAR_QUEEN_OF_THE_SPOONS",
  },
  {
    name: "BossLady",
    image: "/avatars/boss_lady/d8f2538c-ab1b-4737-9ce0-8b9710bb9be5.png",
    description: "AVATAR_BOSS_LADY",
  },
  {
    name: "TheFinn",
    image: "/avatars/finn/8e4bdfe8-8fbb-4244-8f93-8c15c31408ee.png",
    description: "AVATAR_FINN",
  },
  {
    name: "StabIlity",
    image: "/avatars/stability/9e93c420-8eb5-41a7-b656-d2c813300962.png",
    description: "AVATAR_STABILITY",
  },
  {
    name: "JustBorn",
    image: "/avatars/just_born/15f073e5-ef4d-409c-81d6-dba100a94bd0.png",
    description: "AVATAR_JUST_BORN",
  },
  {
    name: "GangGanger",
    image: "/avatars/gang_ganger/6e904349-5ddc-45cd-866e-b9c78ff8b0ac.png",
    description: "AVATAR_GANG_GANGER",
  },
  {
    name: "Maslina",
    image: "/avatars/maslina/bebdfcc5-f207-410c-8351-50a1549c34e3.png",
    description: "AVATAR_MASLINA",
  },
  {
    name: "Inka",
    image: "/avatars/inka/0ca9dd53-13cf-4488-8705-c34e11f369ee.png",
    description: "AVATAR_INKA",
  },
  {
    name: "VampBoy",
    image: "/avatars/vamp_boy/a7c05cb7-3c86-4f34-aed6-db8108ecb9d3.png",
    description: "AVATAR_VAMP_BOY",
  },
  {
    name: "TheBurek",
    image: "/avatars/burek/c24d84c4-f4c3-4d6e-b306-be19f7296d5a.png",
    description: "AVATAR_BUREK",
  },
  {
    name: "TheFish",
    image: "/avatars/fish/2d44a0fd-b62b-421a-837d-c870a5468f5e.png",
    description: "AVATAR_FISH",
  },
  {
    name: "WarMachine",
    image: "/avatars/war_machine/warmachine.webp",
    description: "AVATAR_WAR_MACHINE",
  },
];

export const AvatarPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as {
    target: "user" | "guest";
    guestIndex?: number;
    returnTo?: string;
  };

  const target = state?.target || "user";
  const guestIndex = state?.guestIndex ?? -1;
  const returnTo = state?.returnTo || "/customization";

  const selectedAvatars = new Set<string>();

  const userAvatar = JSON.parse(localStorage.getItem("userAvatar") || "null");
  if (userAvatar?.name && !(target === "user")) {
    selectedAvatars.add(userAvatar.name);
  }

  const guestAvatar = JSON.parse(localStorage.getItem("guestAvatar") || "null");
  if (guestAvatar?.name && !(target === "guest")) {
    selectedAvatars.add(guestAvatar.name);
  }

  const guests = JSON.parse(
    localStorage.getItem("tournamentGuests") ||
      localStorage.getItem("guests") ||
      "[]"
  );
  guests.forEach((g: any, i: number) => {
    if (g?.avatar?.name && !(target === "guest" && i === guestIndex)) {
      selectedAvatars.add(g.avatar.name);
    }
  });

  const handleSelect = (avatar: Avatar) => {
    const selectedAvatar = { name: avatar.name, image: avatar.image };

    navigate(returnTo, {
      state: {
        selectedAvatar,
        target,
        guestIndex,
        fromAvatar: true,
      },
    });
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center text-white p-8 flex flex-col items-center"
      style={{ backgroundImage: "url('/background/gray_background.jpg')" }}
    >
      <button
        onClick={() => navigate(returnTo)}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        {t("AVATAR_BACK_BUTTON")}
      </button>

      <h1 className="text-4xl font-bold text-center mb-10">
        {t("AVATAR_PAGE_TITLE")}
      </h1>

      <div className="w-full max-w-2xl flex flex-col gap-10">
        {avatars.map((avatar) => {
          const isTaken = selectedAvatars.has(avatar.name);

          return (
            <div
              key={avatar.name}
              onClick={() => !isTaken && handleSelect(avatar)}
              className={`bg-gray-800 rounded-xl p-6 shadow-lg text-center transition-transform ${
                isTaken
                  ? "opacity-40 pointer-events-none"
                  : "cursor-pointer hover:scale-105"
              }`}
            >
              <img
                src={avatar.image}
                alt={avatar.name}
                className="w-full max-h-[400px] object-contain mb-4 rounded-md border-4 border-gray-700"
              />
              <h2 className="text-2xl font-bold mb-2">{avatar.name}</h2>
              <p className="text-gray-300 text-sm">{t(avatar.description)}</p>
              {isTaken && (
                <p className="mt-2 text-red-400 text-sm font-semibold">
                  {t("AVATAR_ALREADY_TAKEN")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarPage;

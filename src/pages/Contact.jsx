import MyProfile from "./MyProfileDetails";
 
export default function Contact() {
    const saniaProfile = {
        name: 'Hedy Lamarr',
        bio: 'Hedy Lamarr was an Austrian-American actress and inventor. She co-invented an early version of frequency-hopping spread spectrum communication.',
        imageUrl: 'https://i.imgur.com/yXOvdOSs.jpg',
        imageSize: 120,
        profession: 'Actress & Inventor',
        achievements: ['Co-invented frequency-hopping technology', 'Starred in numerous Hollywood films'],
    };

    return (
      <>
        <MyProfile user={saniaProfile} />
      </>
    );
  }
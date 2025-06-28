 
  export default function MyProfileDetails({user}) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>{user.name}</h1>
        <img
          className="avatar"
          src={user.imageUrl}
          alt={`Photo of ${user.name}`}
          style={{
            width: user.imageSize,
            height: user.imageSize,
            borderRadius: '50%',
            marginBottom: '20px',
          }}
        />
        <h2>Profession: {user.profession}</h2>
        <p><strong>Bio:</strong> {user.bio}</p>
        <h3>Achievements:</h3>
        <ul>
          {user.achievements.map((achievement, index) => (
            <li key={index}>{achievement}</li>
          ))}
        </ul>
      </div>
    );
  }
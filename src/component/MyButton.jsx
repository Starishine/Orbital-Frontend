

export default function MyButton({count, onClick}) {
    
    return (
      <button onClick={onClick}>
        count : {count}
      </button>
    );
  }
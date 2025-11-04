export function Speedtest() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <a
        href="http://10.0.0.5"
        style={{
          color: '#ffffff',
          fontSize: '2rem',
          fontWeight: 'bold',
          textDecoration: 'none',
          textTransform: 'uppercase'
        }}
      >
        RUCKUS SPEEDTEST
      </a>
    </div>
  )
}


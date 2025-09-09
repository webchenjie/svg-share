import { ReactComponent as Logo } from './logo.svg'
import './App.css'

function App() {
  console.log('%c Logo==========>', 'color: #4FC08D; font-weight: bold', Logo)
  return (
    <div>
      <Logo style={{ width: 100, height: 100 }} />
    </div>
  )
}

export default App

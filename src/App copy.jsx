import { useEffect, useState } from "react";
import "./App.css";
import numberWithCommas from "./components/numberFormat";

function App() {
  const [greedy, setGreedy] = useState(null);
  const [timerStarted, setTimerStarted] = useState(
    localStorage.getItem("timerStarted") === "true" || false
  );
  const [startTime, setStartTime] = useState(
    localStorage.getItem("startTime") || null
  );
  const [elapsedTime, setElapsedTime] = useState(
    parseInt(localStorage.getItem("elapsedTime"), 10) || 0
  );
  const [startBalance, setStartBalance] = useState(
    localStorage.getItem("startBalance") || 0
  );
  const [realTimeBalance, setRealTimeBalance] = useState(0); // State for real-time mBlast balance
  const [timerStopped, setTimerStopped] = useState(false); // State to track if the timer is stopped

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        "https://odyn-backend.fly.dev/games/capncouserprofiles/?limit=25&offset=0&ordering=-mblast_balance"
      );
      const data = await res.json();

      if (data) {
        const test = data.results.filter((data) => data.id === 37446);
        setGreedy(test[0]);
        if (timerStarted) {
          setRealTimeBalance(test[0]?.mblast_balance || 0);
        }
      }
    }
    fetchData();
  }, [timerStarted]); // Update when timerStarted changes

  useEffect(() => {
    const storedStartTime = localStorage.getItem("startTime");
    const storedTimerStarted = localStorage.getItem("timerStarted");
    const storedStartBalance = localStorage.getItem("startBalance");

    if (storedTimerStarted === "true" && storedStartTime) {
      const storedElapsedTime = Math.floor(
        (Date.now() - new Date(storedStartTime)) / 1000
      );
      setElapsedTime(storedElapsedTime);
      setStartTime(new Date(storedStartTime));
      setStartBalance(parseFloat(storedStartBalance));
      setTimerStarted(true);
    }
  }, []);

  useEffect(() => {
    let intervalId;

    const updateTimer = () => {
      const now = new Date();
      const elapsedTimeInSeconds = Math.floor(
        (now - new Date(startTime)) / 1000
      );
      setElapsedTime(elapsedTimeInSeconds);
      localStorage.setItem("elapsedTime", elapsedTimeInSeconds);

      // Update real-time balance only when timer is started
      if (timerStarted) {
        async function fetchRealTimeBalance() {
          const res = await fetch(
            "https://odyn-backend.fly.dev/games/capncouserprofiles/?limit=25&offset=0&ordering=-mblast_balance"
          );
          const data = await res.json();
          if (data) {
            const test = data.results.filter((data) => data.id === 37446);
            setRealTimeBalance(test[0]?.mblast_balance || 0);
          }
        }
        fetchRealTimeBalance();
      }
    };

    if (timerStarted) {
      intervalId = setInterval(updateTimer, 1000); // Update timer every second
    }

    return () => {
      clearInterval(intervalId); // Cleanup interval on component unmount
    };
  }, [startTime, timerStarted]);

  const handleTimerStart = () => {
    const now = new Date();
    setStartTime(now.toISOString());
    localStorage.setItem("startTime", now.toISOString());
    setStartBalance(greedy ? greedy.mblast_balance : 0);
    localStorage.setItem("startBalance", greedy ? greedy.mblast_balance : 0);
    setTimerStarted(true);
    setTimerStopped(false); // Reset timer stopped state
    localStorage.setItem("timerStarted", true);
  };

  const handleTimerStop = () => {
    setTimerStarted(false);
    setTimerStopped(true); // Set timer stopped state
    localStorage.setItem("timerStarted", false);
    localStorage.setItem("realTimeBalance", realTimeBalance); // Store real-time balance in local storage
    const now = new Date();
    const elapsedTimeInSeconds = Math.floor((now - new Date(startTime)) / 1000);
    setElapsedTime(elapsedTimeInSeconds);
    localStorage.setItem("elapsedTime", elapsedTimeInSeconds);
  };

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  };

  return (
    <>
      <div>
        <a target="_blank">
          <img
            src="https://capnco.gg/_app/immutable/assets/CapCompanyLogo.wEV2_GJJ.webp"
            className="logo"
            alt="Vite logo"
          />
        </a>
      </div>
      <h1>Captain & Company</h1>

      {timerStarted ? (
        <button onClick={handleTimerStop} className="stopButton">
          Stop
        </button>
      ) : (
        <button onClick={handleTimerStart} className="button">
          Start Timer
        </button>
      )}

      <p className={timerStarted ? "timer" : "timer stopped"}>
        {timerStarted || !timerStopped
          ? formatTime(elapsedTime)
          : formatTime(elapsedTime)}
      </p>

      <div className="card">
        <p className="h1">Current Points</p>
        <p>Start Balance: {numberWithCommas(startBalance)}</p>
        {timerStarted ? (
          <>
            <p>Real-Time mBlast: {numberWithCommas(realTimeBalance)}</p>
            <p className={timerStopped ? "earned" : ""}>
              mBlast Earned:{" "}
              {numberWithCommas(
                greedy ? numberWithCommas(realTimeBalance - startBalance) : 0
              )}
            </p>
          </>
        ) : (
          <>
            <p>
              Real-Time mBlast:{" "}
              {numberWithCommas(localStorage.getItem("realTimeBalance") || 0)}
            </p>
            <p className={timerStopped ? "earned" : ""}>
              mBlast Earned:{" "}
              {numberWithCommas(
                localStorage.getItem("realTimeBalance")
                  ? numberWithCommas(
                      localStorage.getItem("realTimeBalance") - startBalance
                    )
                  : 0
              )}
            </p>
          </>
        )}
      </div>
    </>
  );
}

export default App;

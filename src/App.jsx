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
    parseInt(localStorage.getItem("startBalance"), 10) || 0
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://odyn-backend.fly.dev/games/capncouserprofiles/?limit=25&offset=0&ordering=-mblast_balance"
        );
        const data = await res.json();

        if (data) {
          const test = data.results.filter((data) => data.id === 37446);
          setGreedy(test[0]);
          // Capture the start balance when data is fetched initially
          if (!timerStarted && test[0]) {
            setStartBalance(test[0].mblast_balance);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchDataIntervalId = setInterval(fetchData, 5000); // Fetch data every 5 seconds

    fetchData(); // Initial fetch

    return () => clearInterval(fetchDataIntervalId);
  }, [timerStarted]); // Fetch data when timerStarted changes

  useEffect(() => {
    const storedStartTime = localStorage.getItem("startTime");
    const storedTimerStarted = localStorage.getItem("timerStarted");

    if (storedTimerStarted === "true" && storedStartTime) {
      const storedElapsedTime = Math.floor(
        (Date.now() - new Date(storedStartTime)) / 1000
      );
      setElapsedTime(storedElapsedTime);
      setStartTime(new Date(storedStartTime));
      setTimerStarted(true);
      // Load start balance from local storage if the timer was previously started
      const storedStartBalance =
        parseInt(localStorage.getItem("startBalance"), 10) || 0;
      setStartBalance(storedStartBalance);
    }
  }, []);

  useEffect(() => {
    if (timerStarted) {
      const timerIntervalId = setInterval(() => {
        setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
      }, 1000);

      return () => clearInterval(timerIntervalId);
    }
  }, [timerStarted]);

  const handleTimerStart = () => {
    const now = new Date();
    setStartTime(now.toISOString());
    localStorage.setItem("startTime", now.toISOString());
    setTimerStarted(true);
    localStorage.setItem("timerStarted", true);
    // Capture the start balance when timer is started
    setStartBalance(greedy ? greedy.mblast_balance : 0);
    localStorage.setItem("startBalance", greedy ? greedy.mblast_balance : 0);
  };

  const handleTimerStop = () => {
    setTimerStarted(false);
    localStorage.setItem("timerStarted", false);
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

      <p className="timer">
        {timerStarted ? formatTime(elapsedTime) : "Timer stopped"}
      </p>

      <div className="card">
        <p className="h1">Current Points</p>
        {timerStarted && <p>Start Balance: {numberWithCommas(startBalance)}</p>}
        <p>
          Current mBlast: {greedy ? numberWithCommas(greedy.mblast_balance) : 0}
        </p>
        <p>
          mBlast Earned:{" "}
          {numberWithCommas(greedy ? greedy.mblast_balance - startBalance : 0)}
        </p>
      </div>
    </>
  );
}

export default App;

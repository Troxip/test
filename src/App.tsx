import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const initialGreedy = JSON.parse(localStorage.getItem("greedy")) || null;
  const initialBalanceBefore =
    Number(localStorage.getItem("balanceBefore")) || 0;
  const initialBalanceAfter = Number(localStorage.getItem("balanceAfter")) || 0;
  const initialBalanceDifference =
    Number(localStorage.getItem("balanceDifference")) || 0;
  const initialMBlastPerHour =
    Number(localStorage.getItem("mBlastPerHour")) || 0;

  const [greedy, setGreedy] = useState(initialGreedy);
  const [balanceBefore, setBalanceBefore] = useState(initialBalanceBefore);
  const [balanceAfter, setBalanceAfter] = useState(initialBalanceAfter);
  const [balanceDifference, setBalanceDifference] = useState(
    initialBalanceDifference
  );
  const [mBlastPerHour, setMBlastPerHour] = useState(initialMBlastPerHour);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const storedStartTime = localStorage.getItem("startTime");
    const storedEndTime = localStorage.getItem("endTime");
    const storedIsTimerRunning = localStorage.getItem("isTimerRunning");

    if (storedStartTime && storedEndTime && storedIsTimerRunning) {
      setStartTime(new Date(storedStartTime));
      setEndTime(new Date(storedEndTime));
      setIsTimerRunning(storedIsTimerRunning === "true");
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem("startTime", startTime);
      localStorage.setItem("endTime", endTime);
      localStorage.setItem("isTimerRunning", isTimerRunning.toString());
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isTimerRunning, startTime, endTime]);

  useEffect(() => {
    const fetchRealTimeBalance = async () => {
      const res = await fetch(
        "https://odyn-backend.fly.dev/games/capncouserprofiles/?limit=25&offset=0&ordering=-mblast_balance"
      );
      const data = await res.json();

      if (data) {
        const greedyData = data.results.find((data) => data.id === 37446);
        setGreedy(greedyData);
        setBalanceAfter(greedyData?.mblast_balance || 0);
        setBalanceDifference(greedyData?.mblast_balance - balanceBefore || 0);

        const mBlastEarnedPerHour =
          (greedyData?.mblast_balance - balanceBefore) / (timer / 3600);
        setMBlastPerHour(mBlastEarnedPerHour);
      }
    };

    // Fetch real-time balance initially
    fetchRealTimeBalance();

    // Fetch real-time balance every 5 seconds
    const intervalId = setInterval(fetchRealTimeBalance, 5000);

    return () => clearInterval(intervalId);
  }, [balanceBefore]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const startTimer = () => {
    if (!isTimerRunning) {
      setStartTime(new Date());
      setIsTimerRunning(true);
      setBalanceBefore(balanceAfter);
    }
  };

  const stopTimer = () => {
    if (isTimerRunning) {
      setEndTime(new Date());
      setIsTimerRunning(false); // Update isTimerRunning state to false when stopping the timer
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setStartTime(null);
    setEndTime(null);
    setBalanceAfter(0);
    setBalanceDifference(0);
    setMBlastPerHour(0);
    localStorage.removeItem("startTime");
    localStorage.removeItem("endTime");
    localStorage.removeItem("isTimerRunning");
  };

  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatTimer = (start, end) => {
    if (start && end) {
      const diff = Math.abs(end - start);
      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return "00:00";
  };

  const formatElapsedTime = (start) => {
    if (start) {
      const diff = Math.abs(currentTime - start);
      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return "00:00";
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

      {isTimerRunning ? (
        <button className="stopButton" onClick={stopTimer}>
          Stop
        </button>
      ) : (
        <button className="button" onClick={startTimer}>
          Start Timer
        </button>
      )}
      <p className="timer">{formatElapsedTime(startTime)}</p>

      <div className="card">
        <p className="h1">Current Points</p>
        <p>Balance Before: {formatNumber(balanceBefore)}</p>
        {greedy && (
          <>
            <p>Real-Time Balance: {formatNumber(greedy.mblast_balance)}</p>
            {!isTimerRunning && (
              <p>Balance After: {formatNumber(balanceAfter)}</p>
            )}
            <p>+ mBlast Earned: {formatNumber(balanceDifference)}</p>
          </>
        )}
      </div>
    </>
  );
}

export default App;

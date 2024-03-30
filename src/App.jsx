import React, { useEffect, useState } from "react";
import "./App.css";
import numberWithCommas from "./components/numberFormat";
import fetchMblast from "./fetchMblast";
import FetchMblast from "./fetchMblast";

function App() {
  const [greedy, setGreedy] = useState(null);
  const [timerStarted, setTimerStarted] = useState(
    localStorage.getItem("timerStarted") === "true" || false
  );
  const [startTime, setStartTime] = useState(
    localStorage.getItem("startTime") || null
  );
  const [endTime, setEndTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(
    parseInt(localStorage.getItem("elapsedTime"), 10) || 0
  );
  const [startBalance, setStartBalance] = useState(
    localStorage.getItem("startBalance") || 0
  );
  const [realTimeBalance, setRealTimeBalance] = useState(0);
  const [timerStopped, setTimerStopped] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, [timerStarted]);

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

      if (timerStarted) {
        const fetchRealTimeBalance = async () => {
          const res = await fetch(
            "https://odyn-backend.fly.dev/games/capncouserprofiles/?limit=25&offset=0&ordering=-mblast_balance"
          );
          const data = await res.json();
          if (data) {
            const test = data.results.filter((data) => data.id === 37446);
            setRealTimeBalance(test[0]?.mblast_balance || 0);
          }
        };
        fetchRealTimeBalance();
      }
    };

    if (timerStarted) {
      intervalId = setInterval(updateTimer, 1000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [startTime, timerStarted]);

  const handleTimerStart = async () => {
    const now = new Date();
    setStartTime(now.toISOString());
    localStorage.setItem("startTime", now.toISOString());

    const res = await fetch(
      "https://odyn-backend.fly.dev/games/capncouserprofiles/?limit=25&offset=0&ordering=-mblast_balance"
    );
    const data = await res.json();
    if (data) {
      const test = data.results.filter((data) => data.id === 37446);
      setGreedy(test[0]);
      setStartBalance(test[0]?.mblast_balance || 0);
      localStorage.setItem("startBalance", test[0]?.mblast_balance || 0);
    }

    setTimerStarted(true);
    setTimerStopped(false);
    localStorage.setItem("timerStarted", true);
  };

  const handleTimerStop = () => {
    setTimerStarted(false);
    setTimerStopped(true);
    localStorage.setItem("timerStarted", false);
    localStorage.setItem("realTimeBalance", realTimeBalance);
    const now = new Date();
    const elapsedTimeInSeconds = Math.floor((now - new Date(startTime)) / 1000);
    setElapsedTime(elapsedTimeInSeconds);
    localStorage.setItem("elapsedTime", elapsedTimeInSeconds);
    setEndTime(now.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }));
    localStorage.setItem("endTime", now.toISOString());
  };

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  };

  const earnedPerHour = () => {
    if (elapsedTime === 0) return 0;
    const earned = realTimeBalance - startBalance;
    const hours = elapsedTime / 3600;
    return earned / hours;
  };

  const calculateEarnings = (mblastPerHour) => {
    if (mblastPerHour < 600000) {
      return 2;
    } else if (mblastPerHour < 650000) {
      return 2.25;
    } else if (mblastPerHour < 700000) {
      return 3;
    } else if (mblastPerHour < 750000) {
      return 3.5;
    } else if (mblastPerHour < 800000) {
      return 3.75;
    } else if (mblastPerHour < 860000) {
      return 3.9;
    } else if (mblastPerHour < 900000) {
      return 4;
    } else if (mblastPerHour < 950000) {
      return 4.5;
    } else if (mblastPerHour < 1000000) {
      return 5;
    } else if (mblastPerHour < 1100000) {
      return 5.5;
    } else if (mblastPerHour < 1200000) {
      return 6;
    } else if (mblastPerHour < 1300000) {
      return 6.5;
    } else if (mblastPerHour < 1400000) {
      return 7;
    } else if (mblastPerHour < 1500000) {
      return 7.25;
    } else {
      return 7.5;
    }
  };

  const calculateTotalEarned = () => {
    const hourlyEarnings = calculateEarnings(earnedPerHour());
    const totalEarned = hourlyEarnings * (elapsedTime / 3600);
    return totalEarned.toFixed(2);
  };

  const earningText = () => {
    const mblastPerHour = earnedPerHour();
    const hourlyEarnings = calculateEarnings(mblastPerHour);
    return `Вы заработали $${hourlyEarnings.toFixed(2)} в час`;
  };

  useEffect(() => {
    const reloadPage = () => {
      window.location.reload();
    };

    const reloadInterval = setInterval(reloadPage, 15 * 60 * 1000);

    return () => clearInterval(reloadInterval);
  }, []);

  return (
    <>
      <FetchMblast />
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
          Stop / Стоп
        </button>
      ) : (
        <button onClick={handleTimerStart} className="button">
          Start Timer / Начать таймер
        </button>
      )}

      <p className={timerStarted ? "timer" : "timer stopped"}>
        {timerStarted || !timerStopped
          ? formatTime(elapsedTime)
          : formatTime(elapsedTime)}
      </p>

      <div className="card">
        <p className="h1">Statistics</p>
        <p>
          Start Balance / Начальный баланс:{" "}
          <span className={timerStopped ? "earned" : ""}>
            {numberWithCommas(startBalance)}
          </span>
        </p>
        {timerStarted ? (
          <>
            <p>
              Real-Time mBlast / В реальном времени mBlast:{" "}
              <span className={timerStopped ? "earned" : ""}>
                {numberWithCommas(realTimeBalance)}
              </span>
            </p>
            <p>
              mBlast Earned / Заработано mBlast:{" "}
              <span className={timerStopped ? "earned" : ""}>
                {numberWithCommas(
                  greedy ? numberWithCommas(realTimeBalance - startBalance) : 0
                )}
              </span>
            </p>
          </>
        ) : (
          <>
            <p>
              Real-Time mBlast / В реальном времени mBlast:{" "}
              <span className={timerStopped ? "earned" : ""}>
                {numberWithCommas(localStorage.getItem("realTimeBalance") || 0)}
              </span>
            </p>
            <p>
              mBlast Earned / Заработано mBlast:{" "}
              <span className={timerStopped ? "earned" : ""}>
                {numberWithCommas(
                  localStorage.getItem("realTimeBalance")
                    ? numberWithCommas(
                        localStorage.getItem("realTimeBalance") - startBalance
                      )
                    : 0
                )}
              </span>
            </p>
          </>
        )}
        {timerStopped && (
          <>
            <p>______________________________________</p>
            <p>
              Earned per hour / Заработано в час:{" "}
              <span className={timerStopped ? "earned" : ""}>
                {numberWithCommas(Math.round(earnedPerHour()))} mBlast/hour
              </span>
            </p>
            <p>
              Start Time / Время начала:{" "}
              <span className={timerStopped ? "earned" : ""}>
                {new Date(startTime).toLocaleString("ru-RU", {
                  timeZone: "Europe/Moscow",
                })}
              </span>
            </p>
            <p>
              End Time / Время окончания:{" "}
              <span className={timerStopped ? "earned" : ""}>{endTime}</span>
            </p>
            <p>______________________________________</p>
            <p>{earningText()}</p>
            <p>
              Total Earned / Всего заработано:{" "}
              <span className={timerStopped ? "earned" : ""}>
                ${calculateTotalEarned()}
              </span>
            </p>
          </>
        )}
      </div>
    </>
  );
}

export default App;

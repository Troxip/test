import React, { useEffect, useState } from "react";

export default function FetchMblast() {
  const [combinedData, setCombinedData] = useState([]);
  const [gr33dyBalance, setGr33dyBalance] = useState(0);

  const totalBalance = combinedData.reduce((acc, data) => {
    return (
      acc + (data && data.mblast_balance ? parseInt(data.mblast_balance) : 0)
    );
  }, 0);

  useEffect(() => {
    async function fetchData() {
      const limit = 25;
      const offsets = Array.from({ length: 81 }, (_, index) => index * limit); // Generate offsets from 0 to 2000

      try {
        const responses = await Promise.all(
          offsets.map(async (offset) => {
            const res = await fetch(
              `https://odyn-backend.fly.dev/games/capncouserprofiles/?limit=${limit}&offset=${offset}&ordering=-mblast_balance`
            );
            return res.json();
          })
        );

        // Combine data from all responses
        const combined = responses.reduce((acc, cur) => {
          return acc.concat(cur.results);
        }, []);

        setCombinedData(combined);

        // Find mBlast balance for user "GR33DY"
        const gr33dyUser = combined.find(
          (user) => user.user.username === "GR33DY"
        );
        if (gr33dyUser) {
          setGr33dyBalance(parseInt(gr33dyUser.mblast_balance));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="total">
      <p>Total mBlast: ~{totalBalance && totalBalance.toLocaleString()}</p>
      <p className="greedy">
        Gr33dy mBlast: {gr33dyBalance && gr33dyBalance.toLocaleString()}
      </p>
      <p className="greedy">
        {totalBalance &&
          gr33dyBalance &&
          ((gr33dyBalance / totalBalance) * 100).toFixed(2)}
        % owned by the king Gr33dy
      </p>
    </div>
  );
}

import fetch from "node-fetch";

const query = `
  query getUserProfile($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      contributions {
        points
      }
      profile {
        reputation
        ranking
      }
      submissionCalendar
      submitStats {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
    recentSubmissionList(username: $username) {
      title
      titleSlug
      timestamp
      statusDisplay
      lang
      __typename
    }
    matchedUserStats: matchedUser(username: $username) {
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
          __typename
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
          __typename
        }
        __typename
      }
    }
  }
`;

const formatData = (data) => ({
  totalSolved: data.matchedUser.submitStats.acSubmissionNum[0].count,
  totalSubmissions: data.matchedUser.submitStats.totalSubmissionNum,
  totalQuestions: data.allQuestionsCount[0].count,
  easySolved: data.matchedUser.submitStats.acSubmissionNum[1].count,
  totalEasy: data.allQuestionsCount[1].count,
  mediumSolved: data.matchedUser.submitStats.acSubmissionNum[2].count,
  totalMedium: data.allQuestionsCount[2].count,
  hardSolved: data.matchedUser.submitStats.acSubmissionNum[3].count,
  totalHard: data.allQuestionsCount[3].count,
  ranking: data.matchedUser.profile.ranking,
  contributionPoint: data.matchedUser.contributions.points,
  reputation: data.matchedUser.profile.reputation,
  submissionCalendar: JSON.parse(data.matchedUser.submissionCalendar),
  recentSubmissions: data.recentSubmissionList,
  matchedUserStats: data.matchedUser.submitStats,
});

export const leetcode = async (req, res) => {
  console.log(req.params.id);
  const username = req.params.id; 
  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
      },
      body: JSON.stringify({ query, variables: { username } }),
    });

    const result = await response.json();

    if (response.ok) {
      if (result.errors) {
        console.error("GraphQL Errors:", result.errors);
        return res.status(400).send(result.errors);
      }

      const formattedData = formatData(result.data);
      return res.status(200).send(formattedData);
    } else {
      console.error("HTTP Error:", response.status, response.statusText);
      return res.status(response.status).send({ error: "Failed to fetch data from LeetCode." });
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send({ error: "Internal Server Error", details: error.message });
  }
};



// CodeForces Handler
export const codeforces = async (req, res) => {
  const username = req.params.id;
  try {
    // Fetch user info, rating, and recent submissions in parallel
    const [userInfo, ratingHistory, submissions] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${username}`),
      fetch(`https://codeforces.com/api/user.rating?handle=${username}`),
      fetch(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=10`)
    ]);

    const [userInfoData, ratingData, submissionsData] = await Promise.all([
      userInfo.json(),
      ratingHistory.json(),
      submissions.json()
    ]);

    if (!userInfo.ok || !ratingHistory.ok || !submissions.ok) {
      throw new Error("Failed to fetch CodeForces data");
    }

    const formattedData = {
      userInfo: userInfoData.result[0],
      ratingHistory: ratingData.result,
      recentSubmissions: submissionsData.result,
      handle: username,
      rating: userInfoData.result[0]?.rating,
      maxRating: userInfoData.result[0]?.maxRating,
      rank: userInfoData.result[0]?.rank
    };

    return res.status(200).send(formattedData);
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send({ error: "Internal Server Error", details: error.message });
  }
};

// CodeChef Handler
export const codechef = async (req, res) => {
  const username = req.params.id;
  try {
    const response = await fetch(`https://codechef.com/users/${username}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch CodeChef data");
    }

    const data = await response.json();
    const formattedData = {
      username: username,
      rating: data.rating,
      highestRating: data.highest_rating,
      globalRank: data.global_rank,
      countryRank: data.country_rank,
      stars: data.stars,
      problems: {
        solved: data.problems_solved,
        attempted: data.problems_attempted,
        partiallySolved: data.partially_solved
      }
    };

    return res.status(200).send(formattedData);
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send({ error: "Internal Server Error", details: error.message });
  }
};

// GeeksForGeeks Handler
export const geeksforgeeks = async (req, res) => {
  const username = req.params.id;
  try {
    const response = await fetch(`https://auth.geeksforgeeks.org/user/${username}`, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch GeeksForGeeks data");
    }

    const data = await response.json();
    const formattedData = {
      username: username,
      institute: data.institute,
      score: data.score,
      ranking: data.ranking,
      problemsSolved: {
        total: data.solved,
        school: data.school_solved,
        basic: data.basic_solved,
        easy: data.easy_solved,
        medium: data.medium_solved,
        hard: data.hard_solved
      },
      monthlyScore: data.monthly_score
    };

    return res.status(200).send(formattedData);
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send({ error: "Internal Server Error", details: error.message });
  }
};

// Coding Ninjas Handler
export const codingninjas = async (req, res) => {
  const username = req.params.id;
  try {
    const response = await fetch(`https://www.codingninjas.com/api/v3/public_profile/${username}`);

    if (!response.ok) {
      throw new Error("Failed to fetch Coding Ninjas data");
    }

    const data = await response.json();
    const formattedData = {
      username: username,
      name: data.name,
      score: data.score,
      level: data.level,
      problemsSolved: {
        total: data.total_problems_solved,
        easy: data.easy_problems_solved,
        medium: data.medium_problems_solved,
        hard: data.hard_problems_solved
      },
      streak: data.current_streak,
      maxStreak: data.longest_streak,
      ranking: data.ranking
    };

    return res.status(200).send(formattedData);
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send({ error: "Internal Server Error", details: error.message });
  }
};


// HackerRank API
export const hackerrank = async (req, res) => {
  const username = req.params.id;
  
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const [profile, badges] = await Promise.all([
      axios.get(`https://www.hackerrank.com/rest/hackers/${username}/profile`),
      axios.get(`https://www.hackerrank.com/rest/hackers/${username}/badges`)
    ]);

    // Count badges by level
    const badgeCounts = {
      gold: 0,
      silver: 0,
      bronze: 0
    };

    if (badges.data && Array.isArray(badges.data)) {
      badges.data.forEach(badge => {
        switch(badge.level) {
          case 'gold':
            badgeCounts.gold++;
            break;
          case 'silver':
            badgeCounts.silver++;
            break;
          case 'bronze':
            badgeCounts.bronze++;
            break;
        }
      });
    }

    // Get the main category/track where user has most achievements
    const mainCategory = profile.data.model.tracks?.[0]?.name || '';

    // Format the response to match the component props
    const formattedData = {
      handle: username,
      name: profile.data.model.name || '',
      country: profile.data.model.country || '',
      category: mainCategory,
      rank: profile.data.model.rank || '',
      contestRating: profile.data.model.contest_rating || 0,
      competitions: profile.data.model.competitions_entered || 0,
      // Badge counts
      gold: badgeCounts.gold,
      silver: badgeCounts.silver,
      bronze: badgeCounts.bronze
    };

    return res.status(200).json(formattedData);
    
  } catch (error) {
    console.error("HackerRank API Error:", {
      message: error.message,
      response: error.response?.data
    });

    if (error.response?.status === 404) {
      return res.status(404).json({ 
        error: "HackerRank user not found",
        details: error.response.data.message 
      });
    }

    return res.status(500).json({ 
      error: "Failed to fetch HackerRank data",
      details: error.message 
    });
  }
};
// GitHub API
export const github = async (req, res) => {
  const username = req.params.id;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const [userInfo, repos] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos`)
    ]);

    const userInfoData = await userInfo.json();
    const reposData = await repos.json();

    if (!userInfo.ok || !repos.ok) {
      throw new Error("Failed to fetch GitHub data");
    }
    console.log(userInfoData)
    console.log(reposData)
    const formattedData = {
      handle: username,
      name: userInfoData.name,
      avatarUrl: userInfoData.avatar_url,
      bio: userInfoData.bio,
      publicRepos: userInfoData.public_repos,
      followers: userInfoData.followers,
      following: userInfoData.following,
      recentRepos: reposData
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 10)
        .map(repo => ({
          name: repo.name,
          description: repo.description,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language
        }))
    };

    return res.status(200).json(formattedData);

  } catch (error) {
    console.error("GitHub API Error:", error.message);
    return res.status(500).json({ error: "Failed to fetch GitHub data", details: error.message });
  }
};

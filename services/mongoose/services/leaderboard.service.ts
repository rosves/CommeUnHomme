import { Mongoose } from "mongoose";

export class LeaderboardService {
  constructor(readonly connection: Mongoose) {}

  async getTopByPoints(limit: number = 10): Promise<any[]> {
    const UserChallengeModel = this.connection.model("UserChallenge");
    const UserModel = this.connection.model("User");

    const topUsers = await UserChallengeModel.aggregate([
      {
        $match: { completedAt: { $exists: true } },
      },
      {
        $group: {
          _id: "$userId",
          totalPoints: { $sum: "$pointsEarned" },
          challengesCompleted: { $sum: 1 },
        },
      },
      {
        $sort: { totalPoints: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    const leaderboard = await Promise.all(
      topUsers.map(async (entry: any) => {
        const user = await UserModel.findById(entry._id).select(
          "firstname lastname login"
        );
        return {
          rank: topUsers.indexOf(entry) + 1,
          userId: entry._id,
          firstname: user?.firstname,
          lastname: user?.lastname,
          login: user?.login,
          totalPoints: entry.totalPoints,
          challengesCompleted: entry.challengesCompleted,
        };
      })
    );

    return leaderboard;
  }

  async getTopByChallenges(limit: number = 10): Promise<any[]> {
    const UserChallengeModel = this.connection.model("UserChallenge");
    const UserModel = this.connection.model("User");

    const topUsers = await UserChallengeModel.aggregate([
      {
        $match: { completedAt: { $exists: true } },
      },
      {
        $group: {
          _id: "$userId",
          challengesCompleted: { $sum: 1 },
          totalPoints: { $sum: "$pointsEarned" },
          lastCompletedAt: { $max: "$completedAt" },
        },
      },
      {
        $sort: { challengesCompleted: -1, lastCompletedAt: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    const leaderboard = await Promise.all(
      topUsers.map(async (entry: any) => {
        const user = await UserModel.findById(entry._id).select(
          "firstname lastname login"
        );
        return {
          rank: topUsers.indexOf(entry) + 1,
          userId: entry._id,
          firstname: user?.firstname,
          lastname: user?.lastname,
          login: user?.login,
          challengesCompleted: entry.challengesCompleted,
          totalPoints: entry.totalPoints,
          lastCompletedAt: entry.lastCompletedAt,
        };
      })
    );

    return leaderboard;
  }

  async getMostActive(limit: number = 10): Promise<any[]> {
    const UserChallengeModel = this.connection.model("UserChallenge");
    const UserModel = this.connection.model("User");
    const UserBadgeModel = this.connection.model("UserBadge");

    const activeUsers = await UserChallengeModel.aggregate([
      {
        $group: {
          _id: "$userId",
          totalParticipations: { $sum: 1 },
          completedChallenges: {
            $sum: { $cond: [{ $ne: ["$completedAt", null] }, 1, 0] },
          },
          totalPoints: { $sum: "$pointsEarned" },
        },
      },
      {
        $sort: {
          totalParticipations: -1,
          completedChallenges: -1,
        },
      },
      {
        $limit: limit,
      },
    ]);

    const leaderboard = await Promise.all(
      activeUsers.map(async (entry: any) => {
        const user = await UserModel.findById(entry._id).select(
          "firstname lastname login"
        );
        const badgesCount = await UserBadgeModel.countDocuments({
          userId: entry._id,
        });

        const completionRate =
          entry.totalParticipations > 0
            ? Math.round(
                (entry.completedChallenges / entry.totalParticipations) * 100
              )
            : 0;

        return {
          rank: activeUsers.indexOf(entry) + 1,
          userId: entry._id,
          firstname: user?.firstname,
          lastname: user?.lastname,
          login: user?.login,
          totalParticipations: entry.totalParticipations,
          completedChallenges: entry.completedChallenges,
          totalPoints: entry.totalPoints,
          badgesEarned: badgesCount,
          completionRate,
        };
      })
    );

    return leaderboard;
  }

  async getUserRank(userId: string): Promise<any | null> {
    const UserChallengeModel = this.connection.model("UserChallenge");
    const UserModel = this.connection.model("User");
    const UserBadgeModel = this.connection.model("UserBadge");

    const userStats = await UserChallengeModel.aggregate([
      {
        $match: { userId: new this.connection.Types.ObjectId(userId) },
      },
      {
        $group: {
          _id: "$userId",
          totalPoints: { $sum: "$pointsEarned" },
          completedChallenges: {
            $sum: { $cond: [{ $ne: ["$completedAt", null] }, 1, 0] },
          },
          totalParticipations: { $sum: 1 },
        },
      },
    ]);

    if (userStats.length === 0) {
      return null;
    }

    const user = await UserModel.findById(userId).select(
      "firstname lastname login"
    );
    const badgesCount = await UserBadgeModel.countDocuments({ userId });

    // Compter combien d'utilisateurs ont plus de points
    const usersAbove = await UserChallengeModel.aggregate([
      {
        $match: { completedAt: { $exists: true } },
      },
      {
        $group: {
          _id: "$userId",
          totalPoints: { $sum: "$pointsEarned" },
        },
      },
      {
        $match: { totalPoints: { $gt: userStats[0].totalPoints } },
      },
      {
        $count: "count",
      },
    ]);

    const rank = (usersAbove[0]?.count ?? 0) + 1;
    const completionRate =
      userStats[0].totalParticipations > 0
        ? Math.round(
            (userStats[0].completedChallenges /
              userStats[0].totalParticipations) *
              100
          )
        : 0;

    return {
      userId,
      firstname: user?.firstname,
      lastname: user?.lastname,
      login: user?.login,
      rank,
      totalPoints: userStats[0].totalPoints,
      completedChallenges: userStats[0].completedChallenges,
      totalParticipations: userStats[0].totalParticipations,
      badgesEarned: badgesCount,
      completionRate,
    };
  }
}

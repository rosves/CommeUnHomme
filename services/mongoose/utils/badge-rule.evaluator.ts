import { BadgeRule, RuleType } from "../../../models/badge";

export class BadgeRuleEvaluator {
  static evaluateRule(rule: BadgeRule, userValue: number): boolean {
    const { operator, value } = rule;

    switch (operator) {
      case "égal":
        return userValue === value;
      case "supérieur_ou_égal":
        return userValue >= value;
      case "inférieur_ou_égal":
        return userValue <= value;
      case "supérieur":
        return userValue > value;
      case "inférieur":
        return userValue < value;
      default:
        return false;
    }
  }

  static evaluateConditions(
    rules: BadgeRule[],
    userValues: { [key in RuleType]: number },
    logic: "AND" | "OR" = "AND"
  ): boolean {
    if (logic === "AND") {
      return rules.every((rule) => this.evaluateRule(rule, userValues[rule.type]));
    } else {
      return rules.some((rule) => this.evaluateRule(rule, userValues[rule.type]));
    }
  }

  static async collectUserMetrics(
    userId: string,
    models: any
  ): Promise<{ [key in RuleType]: number }> {
    const { UserChallengeModel } = models;

    const completedChallenges = await UserChallengeModel.find({
      userId,
      isCompleted: true,
    }).populate("challengeId");

    const metrics: any = {
      challenges_completed: completedChallenges.length,
      total_points: completedChallenges.reduce(
        (sum: number, uc: any) => sum + (uc.challengeId?.points || 0),
        0
      ),
      streak_days: await this.calculateStreakDays(userId, models),
      difficulty_master: 0,
      specific_challenge: 0,
      weight_milestone: 0,
      gym_attendance: 0,
      custom: 0,
    };

    return metrics;
  }

  private static async calculateStreakDays(userId: string, models: any): Promise<number> {
    const { UserChallengeModel } = models;

    const challenges = await UserChallengeModel.find({ userId, isCompleted: true })
      .sort({ completedAt: -1 })
      .limit(30);

    let streak = 0;
    let currentDate = new Date();

    for (const challenge of challenges) {
      const completedDate = new Date(challenge.completedAt);
      const daysDiff = Math.floor(
        (currentDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= streak + 1) {
        streak++;
        currentDate = completedDate;
      } else {
        break;
      }
    }

    return streak;
  }
}

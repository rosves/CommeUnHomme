import { BadgeRule, RuleType } from "../../../models/badge";

/**
 * Service pour évaluer les règles de badges
 */
export class BadgeRuleEvaluator {
  /**
   * Évalue une seule règle
   */
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

  /**
   * Évalue les conditions d'attribution d'un badge
   */
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

  /**
   * Collecte les valeurs utilisateur pour chaque type de règle
   */
  static async collectUserMetrics(
    userId: string,
    models: any
  ): Promise<{ [key in RuleType]: number }> {
    const { UserChallengeModel } = models;

    // Récupérer les défis complétés de l'utilisateur
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

  /**
   * Calcule le nombre de jours consécutifs
   */
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

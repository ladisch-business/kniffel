export class GameLogicService {
  static calculateOnes(dice: number[]): number {
    return dice.filter(d => d === 1).length * 1;
  }

  static calculateTwos(dice: number[]): number {
    return dice.filter(d => d === 2).length * 2;
  }

  static calculateThrees(dice: number[]): number {
    return dice.filter(d => d === 3).length * 3;
  }

  static calculateFours(dice: number[]): number {
    return dice.filter(d => d === 4).length * 4;
  }

  static calculateFives(dice: number[]): number {
    return dice.filter(d => d === 5).length * 5;
  }

  static calculateSixes(dice: number[]): number {
    return dice.filter(d => d === 6).length * 6;
  }

  static calculateThreeOfKind(dice: number[]): number {
    const counts = this.getDiceCounts(dice);
    const hasThreeOfKind = Object.values(counts).some(count => count >= 3);
    return hasThreeOfKind ? dice.reduce((sum, die) => sum + die, 0) : 0;
  }

  static calculateFourOfKind(dice: number[]): number {
    const counts = this.getDiceCounts(dice);
    const hasFourOfKind = Object.values(counts).some(count => count >= 4);
    return hasFourOfKind ? dice.reduce((sum, die) => sum + die, 0) : 0;
  }

  static calculateFullHouse(dice: number[]): number {
    const counts = this.getDiceCounts(dice);
    const countValues = Object.values(counts).sort((a, b) => b - a);
    const hasFullHouse = countValues[0] === 3 && countValues[1] === 2;
    return hasFullHouse ? 25 : 0;
  }

  static calculateSmallStraight(dice: number[]): number {
    const uniqueDice = [...new Set(dice)].sort();
    const straights = [
      [1, 2, 3, 4],
      [2, 3, 4, 5],
      [3, 4, 5, 6]
    ];
    
    const hasSmallStraight = straights.some(straight => 
      straight.every(num => uniqueDice.includes(num))
    );
    
    return hasSmallStraight ? 30 : 0;
  }

  static calculateLargeStraight(dice: number[]): number {
    const uniqueDice = [...new Set(dice)].sort();
    const straights = [
      [1, 2, 3, 4, 5],
      [2, 3, 4, 5, 6]
    ];
    
    const hasLargeStraight = straights.some(straight => 
      straight.every(num => uniqueDice.includes(num)) && uniqueDice.length === 5
    );
    
    return hasLargeStraight ? 40 : 0;
  }

  static calculateKniffel(dice: number[]): number {
    const counts = this.getDiceCounts(dice);
    const hasKniffel = Object.values(counts).some(count => count === 5);
    return hasKniffel ? 50 : 0;
  }

  static calculateChance(dice: number[]): number {
    return dice.reduce((sum, die) => sum + die, 0);
  }

  private static getDiceCounts(dice: number[]): Record<number, number> {
    return dice.reduce((counts, die) => {
      counts[die] = (counts[die] || 0) + 1;
      return counts;
    }, {} as Record<number, number>);
  }

  static getScoreCategories() {
    return [
      { name: 'Einser', key: 'ones' as const, calculate: this.calculateOnes, isUpper: true },
      { name: 'Zweier', key: 'twos' as const, calculate: this.calculateTwos, isUpper: true },
      { name: 'Dreier', key: 'threes' as const, calculate: this.calculateThrees, isUpper: true },
      { name: 'Vierer', key: 'fours' as const, calculate: this.calculateFours, isUpper: true },
      { name: 'Fünfer', key: 'fives' as const, calculate: this.calculateFives, isUpper: true },
      { name: 'Sechser', key: 'sixes' as const, calculate: this.calculateSixes, isUpper: true },
      { name: 'Dreierpasch', key: 'three_of_kind' as const, calculate: this.calculateThreeOfKind, isUpper: false },
      { name: 'Viererpasch', key: 'four_of_kind' as const, calculate: this.calculateFourOfKind, isUpper: false },
      { name: 'Full House', key: 'full_house' as const, calculate: this.calculateFullHouse, isUpper: false },
      { name: 'Kleine Straße', key: 'small_straight' as const, calculate: this.calculateSmallStraight, isUpper: false },
      { name: 'Große Straße', key: 'large_straight' as const, calculate: this.calculateLargeStraight, isUpper: false },
      { name: 'Kniffel', key: 'kniffel' as const, calculate: this.calculateKniffel, isUpper: false },
      { name: 'Chance', key: 'chance' as const, calculate: this.calculateChance, isUpper: false },
    ];
  }

  static calculateUpperBonus(scoreBlock: any): number {
    const upperSum = (scoreBlock.ones || 0) + (scoreBlock.twos || 0) + 
                    (scoreBlock.threes || 0) + (scoreBlock.fours || 0) + 
                    (scoreBlock.fives || 0) + (scoreBlock.sixes || 0);
    return upperSum >= 63 ? 35 : 0;
  }

  static calculateTotalScore(scoreBlock: any): number {
    const upperSum = (scoreBlock.ones || 0) + (scoreBlock.twos || 0) + 
                    (scoreBlock.threes || 0) + (scoreBlock.fours || 0) + 
                    (scoreBlock.fives || 0) + (scoreBlock.sixes || 0);
    
    const upperBonus = upperSum >= 63 ? 35 : 0;
    
    const lowerSum = (scoreBlock.three_of_kind || 0) + (scoreBlock.four_of_kind || 0) + 
                    (scoreBlock.full_house || 0) + (scoreBlock.small_straight || 0) + 
                    (scoreBlock.large_straight || 0) + (scoreBlock.kniffel || 0) + 
                    (scoreBlock.chance || 0);
    
    const jokerBonus = scoreBlock.joker_kniffels * 100;
    
    return upperSum + upperBonus + lowerSum + jokerBonus;
  }

  static validateEinsMussWeg(previousKept: boolean[], newKept: boolean[]): boolean {
    const newlyKept = newKept.some((kept, index) => kept && !previousKept[index]);
    return newlyKept;
  }

  static isCategoryAvailable(scoreBlock: any, category: string): boolean {
    return scoreBlock[category] === null || scoreBlock[category] === undefined;
  }

  static canUseJokerKniffel(scoreBlock: any, dice: number[]): boolean {
    return scoreBlock.kniffel === 50 && this.calculateKniffel(dice) === 50;
  }

  static getJokerKniffelScore(category: string, diceValue: number): number {
    switch (category) {
      case 'ones': return diceValue === 1 ? 5 : 0;
      case 'twos': return diceValue === 2 ? 10 : 0;
      case 'threes': return diceValue === 3 ? 15 : 0;
      case 'fours': return diceValue === 4 ? 20 : 0;
      case 'fives': return diceValue === 5 ? 25 : 0;
      case 'sixes': return diceValue === 6 ? 30 : 0;
      case 'three_of_kind':
      case 'four_of_kind':
      case 'chance':
        return diceValue * 5;
      case 'full_house': return 25;
      case 'small_straight': return 30;
      case 'large_straight': return 40;
      default: return 0;
    }
  }
}

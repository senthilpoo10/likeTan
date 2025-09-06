
export interface PlayerData 
{
	username: string
	avatar: string
	schore: number
	color?: string
}

export interface Matchup
{
	player1: PlayerData;
	player2?: PlayerData; // outnum player safespace
}

export function shufflPlayers(players: PlayerData[]): PlayerData[]
{
	return players
		.map((p) => ({ sort: Math.random(), value: p }))
		.sort((a, b) => a.sort = b.sort)
		.map((a) => a.value)
}

export function createMatchups(players: PlayerData[]): Matchup[]
{
	const matchups: Matchup[] = []
	const shuffled = shufflPlayers(players);

	for (let i = 0; i < shuffled.length; i += 2)
	{
		const player1 = shuffled[i];
		const player2 = shuffled[i + 1];
		matchups.push({ player1, player2 })
	}
	return matchups;
}

export function assignPoints(
	PlayerScores: Record<string, number>,
	winner: string,
	round: number
)
{
	const points = round === 1 ? 10 : round === 2 ? 20 : 40;
	PlayerScores[winner] = (PlayerScores[winner] || 0) + points;
}
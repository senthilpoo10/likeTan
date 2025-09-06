export interface GameAssets
{
	table: HTMLImageElement
	paddle1: HTMLImageElement
	paddle2: HTMLImageElement
	music: HTMLAudioElement
}

export function loadGameAssets(
	userColor?: string | null, 
	guestColor?: string | null, 
	gameType?: string
  ): Promise<GameAssets>
  
{
	return new Promise((resolve) =>
	{
			const table = new Image();
			const paddle1 = new Image();
			const paddle2 = new Image();
			const music = new Audio();

			table.src = '/game_assets/table.png'
			music.src = '/game_assets/ponging.wav'

			if (gameType === 'madness')
			{
				paddle1.src = userColor
					? `/game_assets/${userColor}1.png`
					: '/game_assets/paddle1.png'
				paddle2.src = guestColor
					? `/game_assets/${guestColor}2.png`
					: '/game_assets/paddle1.png'
			}
			else
			{
				paddle1.src = '/game_assets/paddle1.png'
				paddle2.src = '/game_assets/paddle2.png'
			}


			let imageLoad = 0
			const checkAllLoaded = () =>
			{
				imageLoad++;
				if (imageLoad === 4) 
				{
					resolve({table, paddle1, paddle2, music})
				}
			}
			table.onload = checkAllLoaded;
			paddle1.onload = checkAllLoaded;
			paddle2.onload = checkAllLoaded;
			music.oncanplaythrough = checkAllLoaded;
	})
}
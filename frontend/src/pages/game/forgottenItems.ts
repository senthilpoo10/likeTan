

type ForgottenItem =
{
	image: HTMLImageElement
	x: number
	y: number
	scale: number
}

const itemImages: HTMLImageElement[] = []
export const activeItems: ForgottenItem[] = []

let canvasRef: HTMLCanvasElement | null=null

function loadItemImages()
{
	if (itemImages.length > 0) return
	const paths = ["/game_assets/cup.png", "/game_assets/cup2.png", "/game_assets/gp.png", "/game_assets/spoon.png"]
	for (const path of paths)
	{
		const img = new Image()
		img.src = path
		itemImages.push(img)
	}
}

export function forgottenItemsInit(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement)
{
	canvasRef = canvas
	loadItemImages()

	const margin = 60
	const centerX = canvas.width / 2

	let x = centerX + (Math.random() * margin * 2 - margin)
	let y = Math.random() * canvas.height

	// make them not spawn on top of eachother
	let tries = 10
	while (tries-- > 0 && activeItems.some(item => Math.hypot(item.x - x, item.y - y) < 40)) {
		x = centerX + (Math.random() * margin * 2 - margin)
		y = Math.random() * canvas.height
	}

	// pick random item
	const availableImages = itemImages.filter(img => !activeItems.find(item => item.image === img))
	if (availableImages.length === 0) return

	const chosenImage = availableImages[Math.floor(Math.random() * availableImages.length)]

	activeItems.push({
		image: chosenImage,
		x,
		y,
		scale: 1, //updated in draw
	})
}

export function drawForgotten(ctx: CanvasRenderingContext2D)
{
	if (!canvasRef) return

	const canvas = canvasRef

	const maxY = 0
	const minY = 500
	const minScale = 0.5
	const maxScale = 1.5

	for (const item of activeItems)
	{
		const progress = (item.y - maxY) / (minY - maxY)
		const scale = minScale + (maxScale - minScale) * progress
		item.scale = scale

		const width = item.image.width * scale
		const height = item.image.height * scale

		ctx.drawImage(item.image, item.x - width / 2, item.y - height / 2, width, height)

	}

}

//cleaning!!
export function clearForgottenItems()
{
	activeItems.length = 0
}

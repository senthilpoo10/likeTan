'use client'

import React from 'react'
import PongGame from './PongGame'

export default function PongPage()
{
	return (
		<div className="flex justify-center items-center h-screen bg-black">
			<PongGame />
		</div>
	)
}
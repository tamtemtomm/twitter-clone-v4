import { useState } from "react";

import CreatePost from "./CreatePost"
import Posts from "../../components/Posts/Posts";

const Home = () => {
  const [feedType, setFeedType] = useState("forYou");

  return (
    <>
			<div className='flex flex-col w-1/2 mr-8 border-r border-gray-700 min-h-screen '>
				{/* Header */}
				<div className='flex justify-between items-center  border-b border-gray-700'>
					<div
						className={
							"flex justify-center flex-1 py-6 px-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
						}
						onClick={() => setFeedType("forYou")}
					>
						For you
						{feedType === "forYou" && (
							<div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary'></div>
						)}
					</div>
					<div
						className='flex justify-center flex-1 py-6 px-3 hover:bg-secondary transition duration-300 cursor-pointer relative'
						onClick={() => setFeedType("following")}
					>
						Following
						{feedType === "following" && (
							<div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary'></div>
						)}
					</div>
				</div>

				{/*  CREATE POST INPUT */}
				<CreatePost />

				{/* POSTS */}
				<Posts feedType={feedType} />
			</div>
		</>
  )
}

export default Home
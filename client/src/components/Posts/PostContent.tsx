export interface PostContentInterface {
  text: string | undefined;
  img: string | undefined;
}

const PostContent = ({ text, img }: PostContentInterface) => {
  return (
    <div className="flex flex-col gap-3 overflow-hidden">
      <span>{text}</span>
      {img && (
        <img
          src={img}
          className="h-80 object-contain rounded-lg border border-gray-700"
          alt=""
        />
      )}
    </div>
  );
};

export default PostContent;

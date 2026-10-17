import Link from "next/link";
interface Blog {
  id: string;
  title: string;
}

export default async function Blogs() {
  const res = await fetch("https://api.vercel.app/blog");
  const blogs: Blog[] = await res.json();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {blogs.map((blog) => (
        <div className="p-4 border rounded-lg" key={blog.id}>
          <div className="h-40 rounded-md mb-4">{blog.id}</div>

          <div className="h-6 rounded w-3/4 mb-3">
            <Link href={`test/${blog.id}`}>{blog.title}</Link>;
          </div>

          <div className="space-y-2">
            <div className="h-4 rounded w-full"></div>
            <div className="h-4 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

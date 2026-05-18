"use client";

export default function Biography() {
  return (
    <section className="flex flex-col gap-10 p-10">
      <div className="flex items-center gap-5">
        <div className="flex flex-col gap-0">
          <h1 className="text-3xl font-bold text-primary">Justin Torres</h1>
          <p className="text-sm font-bold tracking-wide uppercase">
            Internet Enthusiast
          </p>
        </div>
      </div>
      <p className="text-md">
        Hi, I'm Justin! 20 years since my first website and 15 years as chief
        developer for a legal marketing firm. I'm a US citizen and telework in
        Spain, where I spend my free time in nature and staying active.
      </p>
      <ul className="flex gap-2 list-none">
        <li>CV</li>
        <li>GH</li>
        <li>LI</li>
        <li>EM</li>
        <li>WA</li>
      </ul>
      <blockquote>
        <p>“Somewhere, something incredible is waiting to be known.”</p>
        <p>
          <em>― Carl Sagan</em>
        </p>
      </blockquote>
      <p className="text-sm text-subtle">justintorres.com CC-BY-4.0</p>
    </section>
  );
}

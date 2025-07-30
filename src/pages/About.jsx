import React from "react";
import chogyal from "../assets/images/chogyal.jpg";
import { Link } from "react-router-dom";

export default function () {
  return (
    // Main container with responsive padding and background
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Central content card */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 max-w-4xl w-full">
        {/* Header Section: Introduction and Profile Image */}
        <header className="flex flex-col items-center text-center mb-10">
          {/* Profile Image Placeholder */}
          <div
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 
          flex items-center justify-center text-white text-5xl font-bold mb-4 shadow-md overflow-hidden hover:scale-110 transition duration-300 
          hover:rounded-0"
          >
            <img
              src={chogyal}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Hello, I'm Chogyal.
          </h1>
          <p className="text-base text-gray-600 max-w-2xl">
            - A passionate self-taught developer transforming ideas into
            impactful digital experiences.
          </p>
        </header>

        {/* About Me Section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-5 text-center">
            My Journey in Code
          </h2>
          <p className="text-base text-gray-700 leading-relaxed mb-4">
            My path into the world of development is fueled by an insatiable
            curiosity and a drive to create. Without a traditional degree, I've
            embraced a self-paced learning model, diving deep into technologies
            and building projects that solve real-world problems. This hands-on
            approach has equipped me with practical knowledge and a robust
            problem-solving mindset, allowing me to adapt quickly to new
            challenges.
          </p>
          <p className="text-base text-gray-700 leading-relaxed">
            I believe in the power of continuous learning and the endless
            possibilities that technology offers. Every line of code is an
            opportunity to learn, innovate, and contribute to something
            meaningful.
          </p>
        </section>

        {/* Continuous Learning Mindset Section */}
        <section className="mb-10 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-5">
            A Commitment to Growth
          </h2>
          <p className="text-base text-gray-700 leading-relaxed">
            The tech landscape is ever-evolving, and so am I. My approach to
            development is rooted in a continuous learning mindset, always
            seeking out new technologies, best practices, and innovative
            solutions. This adaptability ensures I can tackle diverse challenges
            and contribute effectively to dynamic environments.
          </p>
        </section>

        {/* Philosophy Quote */}
        <section className="mb-10 text-center">
          <blockquote className="italic text-xl sm:text-2xl text-gray-600 border-l-4 border-blue-400 pl-4 py-2 mx-auto max-w-prose">
            “I rise.”
          </blockquote>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Link
            to="/"
            className="inline-block bg-[#1a1a1a] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out"
          >
            Let’s build something meaningful.
          </Link>
        </section>
      </div>
    </div>
  );
}

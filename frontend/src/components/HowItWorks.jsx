function HowItWorks() {


  const steps = [
    {
      number: "01",
      icon: "📤",
      title: "Upload Your Notes",
      desc: "Upload PDFs, documents or study materials to StudyMind AI."
    },
    {
      number: "02",
      icon: "🤖",
      title: "AI Analyzes Content",
      desc: "Our AI understands your notes and prepares smart learning content."
    },
    {
      number: "03",
      icon: "🎯",
      title: "Learn & Practice",
      desc: "Get summaries, quizzes and instant answers to improve learning."
    }
  ];


  return (

    <section className="
    py-20
    bg-white">


      <div className="
      max-w-7xl
      mx-auto
      px-6">


        {/* Heading */}

        <div className="
        text-center
        mb-14">


          <h2 className="
          text-4xl
          font-extrabold
          text-gray-800">

            How StudyMind AI Works 🚀

          </h2>


          <p className="
          mt-4
          text-gray-600">

            Three simple steps to make your learning smarter.

          </p>


        </div>




        {/* Steps */}

        <div className="
        grid
        md:grid-cols-3
        gap-10">


          {
            steps.map((step,index)=>(


              <div
              key={index}
              className="
              relative
              bg-gradient-to-br
              from-indigo-50
              to-purple-50
              rounded-3xl
              p-8
              text-center
              shadow-md
              hover:shadow-xl
              hover:-translate-y-2
              transition">


                {/* Number */}

                <div className="
                absolute
                top-5
                right-6
                text-5xl
                font-bold
                text-gray-200">

                  {step.number}

                </div>



                <div className="
                w-20
                h-20
                mx-auto
                rounded-full
                bg-gradient-to-r
                from-indigo-600
                to-purple-600
                flex
                items-center
                justify-center
                text-4xl
                text-white">


                  {step.icon}


                </div>




                <h3 className="
                mt-6
                text-xl
                font-bold
                text-gray-800">


                  {step.title}


                </h3>



                <p className="
                mt-3
                text-gray-600">


                  {step.desc}


                </p>


              </div>


            ))
          }


        </div>


      </div>


    </section>

  );
}

export default HowItWorks;
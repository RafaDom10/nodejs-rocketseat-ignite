interface Course {
  name: string;
  educator: string;
  duration?: number;
}

class CreateCourseService {

  execute({ duration = 8, educator, name }: Course) {
    console.log(name, duration, educator);
  }
}

export default new CreateCourseService();
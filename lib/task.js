/*
Task
{
  id                : UUID
  name              : String
  url               : String
  done              : Boolean
  priority          : Number
  increase          : Number
  expected_duration : Object
  createdAt         : Timestamp
}

*/

class Task {

  static create(props={}) {
    return Object.assign({
      name:              "",
      url:               "",
      priority:          1,
      increase:          1,
      done:              false,
      expected_duration: { days: 1 }
    },
    props,
    {
      id:          tools.uuidv4(),
      createdAt:   Date.now(),
    });
  }

}

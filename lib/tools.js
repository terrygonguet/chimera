const tools = {
  /**
  * @returns {UUID}
  */
  uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
  },

  /**
  * Returns a random integer in the range.
  *
  * @param {Number} min The lower boundary of the output range
  * @param {Number} max The upper boundary of the output range
  * @returns A number in the range [min, max]
  */
  randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },

  /**
  * @returns the HTML color
  */
  randColor() {
    return `rgb(${tools.randInt(75,200)},${tools.randInt(75,200)},${tools.randInt(75,200)})`;
  },
}

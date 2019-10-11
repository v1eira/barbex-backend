module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('ratings', 'comment', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('ratings', 'comment');
  },
};

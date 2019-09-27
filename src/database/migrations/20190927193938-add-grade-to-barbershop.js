module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('barbershops', 'grade', {
      type: Sequelize.FLOAT(1, 1),
      allowNull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('barbershops', 'grade');
  },
};

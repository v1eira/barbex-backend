module.exports = {
  up: queryInterface => {
    return queryInterface.removeColumn('users', 'barber');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'barber', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },
};

module.exports = {
  up: queryInterface => {
    return queryInterface.removeColumn('barbershops', 'address');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('barbershops', 'address', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};

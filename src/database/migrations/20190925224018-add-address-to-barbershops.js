module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('barbershops', 'address_id', {
      type: Sequelize.INTEGER,
      references: { model: 'addresses', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: false,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('barbershops', 'address_id');
  },
};

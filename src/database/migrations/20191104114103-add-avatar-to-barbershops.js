module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('barbershops', 'avatar_id', {
      type: Sequelize.INTEGER,
      references: { model: 'images', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('barbershops', 'avatar_id');
  },
};

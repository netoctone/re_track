class Bts
  @@bts_list = []

  def self.inherited descendant
    @@bts_list << descendant
  end

  def self.bts_list
    @@bts_list
  end
end

module WebAPI

  class Service
    def self.inherited descendant
      if self.equal?(Service)
        descendant.instance_eval do
          @list = []

          def inherited descendant
            @list << descendant

            descendant.instance_eval do
              @url_settable = false

              def url_settable
                @url_settable = true
              end

              def url_settable?
                @url_settable
              end
            end
          end

          class << self
            attr_reader :list
          end
        end
      end
    end
  end

end
